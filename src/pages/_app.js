import { NavBar } from "@/components/NavBar/NavBar"
import { AudioPlayer } from "@/components/AudioPlayer/AudioPlayer"
import "@/styles/litera-bootstrap.css"
import "@/styles/globals.css"
import { Container } from "react-bootstrap"
import { useEffect } from "react"
import supabase from "@/supabase/component"
import {
  useAlarmStore,
  useScheduleStore,
  useAuthStore,
  useAudioStore,
  useConfigStore,
} from "@/services/useStore"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { Agentation } from "agentation"
import { API_ENDPOINTS } from "@/config/constants"

export default function App({ Component, pageProps }) {
  const setAlarms = useAlarmStore((state) => state.setAlarms);
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const session = useAuthStore((state) => state.session);
  const setAuthSuccessMessage = useAuthStore((state) => state.setAuthSuccessMessage);
  const setForceLoginOpen = useAuthStore((state) => state.setForceLoginOpen);
  const setSchedules = useScheduleStore((state) => state.setSchedules);
  const currentScheduleId = useScheduleStore((state) => state.currentScheduleId);
  const setCurrentScheduleId = useScheduleStore((state) => state.setCurrentScheduleId);
  const setUserSounds = useAudioStore((state) => state.setUserSounds);
  const setDefaultSound = useAudioStore((state) => state.setDefaultSound);
  const setWarningLeadMinutes = useAudioStore((state) => state.setWarningLeadMinutes);
  const setWarningChimeId = useAudioStore((state) => state.setWarningChimeId);
  const setAppConfig = useConfigStore((state) => state.setAppConfig);

  useEffect(() => {
    // Check for email confirmation hash in URL
    if (globalThis.window !== undefined && globalThis.window.location.hash) {
      const hashParams = new URLSearchParams(globalThis.window.location.hash.slice(1));
      if (hashParams.get('type') === 'signup') {
        // Clear the hash from URL so it doesn't process again
        globalThis.window.history.replaceState(null, '', globalThis.window.location.pathname + globalThis.window.location.search);
        
        // Ensure they are logged out so the login UI shows
        supabase.auth.signOut().then(() => {
          setAuthSuccessMessage('Email Confirmed! Please login again.');
          setForceLoginOpen(true);
        });
      }
    }
  }, [setAuthSuccessMessage, setForceLoginOpen]);

  useEffect(() => {
    const fetchSchedules = async (currentSession) => {
      if (currentSession) {
        try {
          const response = await fetch(API_ENDPOINTS.SCHEDULES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentSession.user.id }),
          });
          const data = await response.json();
          if (response.ok) {
            setSchedules(data);
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

    const fetchSounds = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ALARM_SOUNDS);
        const data = await response.json();
        if (response.ok) {
          setUserSounds(data.sounds || []);
          const defaultSoundObj = data.sounds?.find(s => s.id === data.defaultSoundId);
          setDefaultSound(defaultSoundObj?.storage_url || null);
        }
      } catch (error) {
        console.error('Failed to fetch sounds:', error);
      }

      try {
        const response = await fetch(API_ENDPOINTS.USER_PROFILE);
        const data = await response.json();
        if (response.ok) {
          setWarningLeadMinutes(data.warning_lead_minutes ?? 3);
          setWarningChimeId(data.warning_chime_id || null);
        }
      } catch (error) {
        console.error('Failed to fetch warning settings:', error);
      }
    };

    const fetchConfig = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CONFIG);
        const data = await response.json();
        if (response.ok) {
          setAppConfig({
            maxLabelLength: data.max_label_length,
            maxScheduleNameLength: data.max_schedule_name_length,
            defaultChimeUrl: data.default_chime_url,
            defaultWarningChimeUrl: data.default_warning_chime_url,
            Account_Creation: data.Account_Creation,
            blocked_magic_link_domains: data.blocked_magic_link_domains,
          });
        }
      } catch (error) {
        console.error('Failed to fetch app config:', error);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchSchedules(session);
        fetchSounds();
      }
    });

    fetchConfig();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      switch (_event) {
        case 'INITIAL_SESSION':
          break;
        case 'SIGNED_IN':
          fetchSchedules(session);
          fetchSounds();
          break;
        case 'SIGNED_OUT':
          setAlarms({});
          setSchedules([]);
          setCurrentScheduleId(null);
          setUserSounds([]);
          setDefaultSound(null);
          setWarningLeadMinutes(3);
          setWarningChimeId(null);
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
  }, [setAlarms, setSession, setUser, setSchedules, setCurrentScheduleId, currentScheduleId, setUserSounds, setDefaultSound, setWarningLeadMinutes, setWarningChimeId, setAppConfig]);

  // Separate effect to handle alarm fetching when schedule changes
  useEffect(() => {
    const fetchAlarms = async () => {
      if (session?.user?.id && currentScheduleId) {
        try {
          const response = await fetch(API_ENDPOINTS.ALARMS, {
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
    <NavBar />
    <Component {...pageProps} />
    <AudioPlayer />
    <SpeedInsights/>
    <Analytics/>
    {process.env.NODE_ENV === 'development' && <Agentation endpoint="http://localhost:4747" />}
  </Container>);
}
