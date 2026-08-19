import { create } from 'zustand'
import { DAYS_OF_WEEK } from '@/config/constants'

const setInitialAlarms = () => {
  return DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = []
    return acc
  }, {})
}

export const useAlarmStore = create((set) => ({
  alarms: { ...setInitialAlarms() },
  setAlarms: (newAlarms) => set({ alarms: newAlarms }),
  resetAlarms: () => set({ alarms: { ...setInitialAlarms() } }),
}))
