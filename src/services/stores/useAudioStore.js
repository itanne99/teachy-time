import { create } from 'zustand'
import { DEFAULT_CHIME_URL } from '@/config/constants'

const initialAudioState = {
  audioSrc: DEFAULT_CHIME_URL,
  isPlaying: false,
  userSounds: [],
  defaultSound: null,
  warningLeadMinutes: 3,
  warningChimeId: null,
}

export const useAudioStore = create((set) => ({
  ...initialAudioState,
  setAudioSrc: (src) => set({ audioSrc: src }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setUserSounds: (sounds) => set({ userSounds: sounds }),
  setDefaultSound: (url) => set({ defaultSound: url }),
  setWarningLeadMinutes: (minutes) => set({ warningLeadMinutes: minutes }),
  setWarningChimeId: (id) => set({ warningChimeId: id }),
  resetAudio: () => set({ ...initialAudioState }),
}))
