import { create } from 'zustand'

export const useScheduleStore = create((set) => ({
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
  currentScheduleId: null,
  setCurrentScheduleId: (id) => set({ currentScheduleId: id }),
  resetSchedules: () => set({ schedules: [], currentScheduleId: null }),
}))
