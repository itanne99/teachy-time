import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '@/services/useStore'
import { DAYS_OF_WEEK } from '@/config/constants'

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      alarms: DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = []
        return acc
      }, {}),
      schedules: [],
      currentScheduleId: null,
      user: null,
      session: null,
      userSounds: [],
      defaultSound: null,
      warningLeadMinutes: 3,
      warningChimeId: null,
    })
  })

  it('initializes with default state for all days of the week', () => {
    const state = useStore.getState()
    DAYS_OF_WEEK.forEach((day) => {
      expect(state.alarms[day]).toEqual([])
    })
    expect(state.schedules).toEqual([])
    expect(state.currentScheduleId).toBeNull()
    expect(state.user).toBeNull()
  })

  it('updates alarms state correctly', () => {
    const newAlarms = {
      ...useStore.getState().alarms,
      Monday: [
        { id: 1, label: 'Math', start_time: '09:00:00', end_time: '09:45:00', day_of_week: 'Monday' },
      ],
    }
    useStore.getState().setAlarms(newAlarms)
    expect(useStore.getState().alarms.Monday).toHaveLength(1)
    expect(useStore.getState().alarms.Monday[0].label).toBe('Math')
  })

  it('updates currentScheduleId, user, and session', () => {
    useStore.getState().setCurrentScheduleId(101)
    expect(useStore.getState().currentScheduleId).toBe(101)

    const mockUser = { id: 'usr-1', email: 'teacher@school.edu' }
    useStore.getState().setUser(mockUser)
    expect(useStore.getState().user).toEqual(mockUser)

    const mockSession = { access_token: 'xyz' }
    useStore.getState().setSession(mockSession)
    expect(useStore.getState().session).toEqual(mockSession)
  })

  it('updates sound settings and warning lead time', () => {
    useStore.getState().setUserSounds([{ id: 1, sound_name: 'Bell' }])
    expect(useStore.getState().userSounds).toHaveLength(1)

    useStore.getState().setDefaultSound('https://example.com/bell.mp3')
    expect(useStore.getState().defaultSound).toBe('https://example.com/bell.mp3')

    useStore.getState().setWarningLeadMinutes(5)
    expect(useStore.getState().warningLeadMinutes).toBe(5)
  })

  it('merges dynamic app config into store state', () => {
    useStore.getState().setAppConfig({
      maxLabelLength: 60,
      maxScheduleNameLength: 120,
    })
    expect(useStore.getState().maxLabelLength).toBe(60)
    expect(useStore.getState().maxScheduleNameLength).toBe(120)
  })
})
