import { NavBar } from "@/components/NavBar/NavBar";
import "bootswatch/dist/litera/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { create } from "zustand";
import { useEffect } from "react";
import supabase from "@/supabase/component";

const setInitialAlarms = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});
}

const useStore = create((set) => ({
  alarms: { ...setInitialAlarms() },
  setAlarms: (newAlarms) => set({ alarms: newAlarms }),
}));

export default function App({ Component, pageProps }) {
  const setAlarms = useStore((state) => state.setAlarms);
  const alarms = useStore((state) => state.alarms);

  useEffect(() => {
    const fetchAlarms = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && Object.keys(alarms).every(day => alarms[day].length === 0)) {
        try {
          const response = await fetch('/api/alarms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: session.user.id }),
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
  }, []);

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session)
  
    if (event === 'INITIAL_SESSION') {
      // handle initial session
    } else if (event === 'SIGNED_IN') {
      // handle sign in event
    } else if (event === 'SIGNED_OUT') {
      // handle sign out event
    } else if (event === 'PASSWORD_RECOVERY') {
      // handle password recovery event
    } else if (event === 'TOKEN_REFRESHED') {
      // handle token refreshed event
    } else if (event === 'USER_UPDATED') {
      // handle user updated event
    }
  })
  
  // call unsubscribe to remove the callback
  data.subscription.unsubscribe()
  return(
  <Container fluid className="p-0 bg-light d-flex flex-column" style={{ minHeight: "100vh" }}>
    <NavBar useStore={useStore} />
    <Component {...pageProps} useStore={useStore} />
  </Container>);
}
