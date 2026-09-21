import { create } from 'zustand'
import { DEFAULT_CHIME_URL, DEFAULT_WARNING_CHIME_URL } from '@/config/constants'

const initialConfigState = {
  maxLabelLength: 50,
  maxScheduleNameLength: 100,
  defaultChimeUrl: DEFAULT_CHIME_URL,
  defaultWarningChimeUrl: DEFAULT_WARNING_CHIME_URL,
  Account_Creation: true,
  blocked_magic_link_domains: [],
}

export const useConfigStore = create((set) => ({
  ...initialConfigState,
  setAppConfig: (config) => set((state) => ({ ...state, ...config })),
  resetAppConfig: () => set({ ...initialConfigState }),
}))
