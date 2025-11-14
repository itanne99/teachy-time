import { create } from "zustand";

const setInitialAlarms = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});
}

export const useStore = create((set) => ({
  alarms: { ...setInitialAlarms() },
  setAlarms: (newAlarms) => set({ alarms: newAlarms }),
  user: null,
  setUser: (user) => set({ user }),
  session: null,
  setSession: (session) => set({ session }),
}));