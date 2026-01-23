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
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
  currentScheduleId: null,
  setCurrentScheduleId: (id) => set({ currentScheduleId: id }),
  user: null,
  setUser: (user) => set({ user }),
  session: null,
  setSession: (session) => set({ session }),
  passwordResetFlag: null,
  setPasswordResetFlag: (flag) => set({ passwordResetFlag: flag }),
}));
