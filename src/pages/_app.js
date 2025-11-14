import { NavBar } from "@/components/NavBar/NavBar";
import "bootswatch/dist/litera/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { useEffect } from "react";
import supabase from "@/supabase/component";
import { useStore } from "@/services/useStore";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function App({ Component, pageProps }) {
  const setAlarms = useStore((state) => state.setAlarms);
  const alarms = useStore((state) => state.alarms);
  const setUser = useStore((state) => state.setUser);
  const setSession = useStore((state) => state.setSession);

  useEffect(() => {
    const fetchAlarms = async (currentSession) => {
      if (currentSession && Object.keys(alarms).every(day => alarms[day].length === 0)) {
          try {
            const response = await fetch('/api/alarms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: currentSession.user.id }),
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchAlarms(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('supabase logs:', _event, session)
      setSession(session);
      setUser(session?.user ?? null);

      switch (_event) {
        case 'INITIAL_SESSION':
          fetchAlarms(session);
          break;
        case 'SIGNED_IN':
          fetchAlarms(session);
          break;
        case 'SIGNED_OUT':
          setAlarms({});
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
  }, [alarms, setAlarms, setSession, setUser]);

  return(
  <Container fluid className="p-0 bg-light d-flex flex-column" style={{ minHeight: "100vh" }}>
    <NavBar useStore={useStore} />
    <Component {...pageProps} useStore={useStore} />
    <SpeedInsights/>
  </Container>);
}
