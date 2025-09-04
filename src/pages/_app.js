import { NavBar } from "@/components/NavBar/NavBar";
import "bootswatch/dist/litera/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { create } from 'zustand';

const setInitialAlarms = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});
}

const useStore = create((set) => ({
  alarms: {...setInitialAlarms()},
  setAlarms: (newAlarms) => set({ alarms: newAlarms }),
}));

export default function App({ Component, pageProps }) {

  return(
  <Container fluid className="p-0 bg-light d-flex flex-column" style={{ minHeight: "100vh" }}>
    <NavBar/>
    <Component {...pageProps} useStore={useStore} />
  </Container>);
}
