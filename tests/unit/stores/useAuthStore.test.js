import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/services/stores/useAuthStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().resetAuth()
  })

  it('initializes with default auth values', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.authSuccessMessage).toBe('')
    expect(state.forceLoginOpen).toBe(false)
    expect(state.authModalOpen).toBe(false)
    expect(state.authModalView).toBe('login')
    expect(state.passwordResetFlag).toBeNull()
  })

  it('updates user and session correctly', () => {
    const mockUser = { id: 'usr-123', email: 'test@example.com' }
    const mockSession = { access_token: 'token-123' }

    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().setSession(mockSession)

    expect(useAuthStore.getState().user).toEqual(mockUser)
    expect(useAuthStore.getState().session).toEqual(mockSession)
  })

  it('updates modal state and view', () => {
    useAuthStore.getState().setAuthModalOpen(true)
    useAuthStore.getState().setAuthModalView('signup')
    useAuthStore.getState().setForceLoginOpen(true)
    useAuthStore.getState().setAuthSuccessMessage('Logged in!')
    useAuthStore.getState().setPasswordResetFlag('RESET_REQUIRED')

    expect(useAuthStore.getState().authModalOpen).toBe(true)
    expect(useAuthStore.getState().authModalView).toBe('signup')
    expect(useAuthStore.getState().forceLoginOpen).toBe(true)
    expect(useAuthStore.getState().authSuccessMessage).toBe('Logged in!')
    expect(useAuthStore.getState().passwordResetFlag).toBe('RESET_REQUIRED')
  })

  it('resets auth state cleanly via resetAuth', () => {
    useAuthStore.getState().setUser({ id: 'usr-123' })
    useAuthStore.getState().setAuthSuccessMessage('Welcome')

    useAuthStore.getState().resetAuth()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().authSuccessMessage).toBe('')
  })
})
