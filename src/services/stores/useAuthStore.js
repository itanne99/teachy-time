import { create } from 'zustand'

const initialAuthState = {
  user: null,
  session: null,
  authSuccessMessage: '',
  forceLoginOpen: false,
  authModalOpen: false,
  authModalView: 'login',
  passwordResetFlag: null,
}

export const useAuthStore = create((set) => ({
  ...initialAuthState,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setAuthSuccessMessage: (msg) => set({ authSuccessMessage: msg }),
  setForceLoginOpen: (open) => set({ forceLoginOpen: open }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAuthModalView: (view) => set({ authModalView: view }),
  setPasswordResetFlag: (flag) => set({ passwordResetFlag: flag }),
  resetAuth: () => set({ ...initialAuthState }),
}))
