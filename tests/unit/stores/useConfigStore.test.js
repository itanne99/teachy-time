import { describe, it, expect } from 'vitest'
import { useConfigStore } from '@/services/stores/useConfigStore'
import { DEFAULT_CHIME_URL, DEFAULT_WARNING_CHIME_URL } from '@/config/constants'

describe('useConfigStore', () => {
  it('initializes with default app configuration constants', () => {
    const state = useConfigStore.getState()
    expect(state.maxLabelLength).toBe(50)
    expect(state.maxScheduleNameLength).toBe(100)
    expect(state.defaultChimeUrl).toBe(DEFAULT_CHIME_URL)
    expect(state.defaultWarningChimeUrl).toBe(DEFAULT_WARNING_CHIME_URL)
  })

  it('updates dynamic app configuration via setAppConfig', () => {
    useConfigStore.getState().setAppConfig({
      maxLabelLength: 80,
      maxScheduleNameLength: 150,
      Account_Creation: false,
      blocked_magic_link_domains: ['spam.com'],
    })

    const state = useConfigStore.getState()
    expect(state.maxLabelLength).toBe(80)
    expect(state.maxScheduleNameLength).toBe(150)
    expect(state.Account_Creation).toBe(false)
    expect(state.blocked_magic_link_domains).toEqual(['spam.com'])
  })
})
