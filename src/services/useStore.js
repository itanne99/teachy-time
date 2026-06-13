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
  audioSrc: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/wind-chimes-37762.mp3",
  setAudioSrc: (src) => set({ audioSrc: src }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  userSounds: [],
  setUserSounds: (sounds) => set({ userSounds: sounds }),
  defaultSound: null,
  setDefaultSound: (url) => set({ defaultSound: url }),
  warningLeadMinutes: 3,
  setWarningLeadMinutes: (minutes) => set({ warningLeadMinutes: minutes }),
  warningChimeId: null,
  setWarningChimeId: (id) => set({ warningChimeId: id }),
}));
