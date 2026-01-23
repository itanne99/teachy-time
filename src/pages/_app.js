import { NavBar } from "@/components/NavBar/NavBar";
import "@/styles/litera-bootstrap.css"
import { Container } from "react-bootstrap";
import { useEffect } from "react";
import supabase from "@/supabase/component";
import { useStore } from "@/services/useStore";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export default function App({ Component, pageProps }) {
  const setAlarms = useStore((state) => state.setAlarms);
  const alarms = useStore((state) => state.alarms);
  const setUser = useStore((state) => state.setUser);
  const setSession = useStore((state) => state.setSession);
  const setSchedules = useStore((state) => state.setSchedules);
  const currentScheduleId = useStore((state) => state.currentScheduleId);
  const setCurrentScheduleId = useStore((state) => state.setCurrentScheduleId);
  const session = useStore((state) => state.session);

  useEffect(() => {
    const fetchSchedules = async (currentSession) => {
      if (currentSession) {
        try {
          const response = await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentSession.user.id }),
          });
          const data = await response.json();
          if (response.ok) {
            setSchedules(data);
            // Only set default if one isn't already selected
            if (!currentScheduleId) {
              const mainSchedule = data.find(s => s.name.toLowerCase() === 'main') || data[0];
              if (mainSchedule) {
                setCurrentScheduleId(mainSchedule.id);
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch schedules:', error);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) fetchSchedules(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      switch (_event) {
        case 'INITIAL_SESSION':
          break;
        case 'SIGNED_IN':
          fetchSchedules(session);
          break;
        case 'SIGNED_OUT':
          setAlarms({});
          setSchedules([]);
          setCurrentScheduleId(null);
          break;
        case 'PASSWORD_RECOVERY':
          break;
        case 'TOKEN_REFRESHED':
          break;
        case 'USER_UPDATED':
          break;
        default:
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [setAlarms, setSession, setUser, setSchedules, setCurrentScheduleId, currentScheduleId]);

  // Separate effect to handle alarm fetching when schedule changes
  useEffect(() => {
    const fetchAlarms = async () => {
      if (session?.user?.id && currentScheduleId) {
        try {
          const response = await fetch('/api/alarms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: session.user.id, schedule_id: currentScheduleId }),
          });
          const data = await response.json();
          if (response.ok) {
            setAlarms(data);
          }
        } catch (error) {
          console.error('Failed to fetch alarms:', error);
        }
      }
    };

    fetchAlarms();
  }, [currentScheduleId, session?.user?.id, setAlarms]);

  return(
  <Container fluid className="p-0 bg-light d-flex flex-column" style={{ minHeight: "100vh" }}>
    <NavBar useStore={useStore} />
    <Component {...pageProps} useStore={useStore} />
    <SpeedInsights/>
    <Analytics/>
  </Container>);
}
