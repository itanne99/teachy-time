import { create } from 'zustand'
import { DAYS_OF_WEEK, DEFAULT_CHIME_URL, DEFAULT_WARNING_CHIME_URL } from '@/config/constants'

const setInitialAlarms = () => {
  return DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = []
    return acc
  }, {})
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
  audioSrc: DEFAULT_CHIME_URL,
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

  // Dynamic configuration states loaded from app_config
  maxLabelLength: 50,
  maxScheduleNameLength: 100,
  defaultChimeUrl: DEFAULT_CHIME_URL,
  defaultWarningChimeUrl: DEFAULT_WARNING_CHIME_URL,
  setAppConfig: (config) => set((state) => ({ ...state, ...config })),
}))

