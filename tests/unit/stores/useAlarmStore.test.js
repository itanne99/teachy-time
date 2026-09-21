import { describe, it, expect, beforeEach } from 'vitest'
import { useAlarmStore } from '@/services/stores/useAlarmStore'
import { DAYS_OF_WEEK } from '@/config/constants'

describe('useAlarmStore', () => {
  beforeEach(() => {
    useAlarmStore.getState().resetAlarms()
  })

  it('initializes with empty alarm arrays for all days of the week', () => {
    const { alarms } = useAlarmStore.getState()
    DAYS_OF_WEEK.forEach((day) => {
      expect(alarms[day]).toEqual([])
    })
  })

  it('updates alarms via setAlarms action', () => {
    const mockAlarms = {
      Monday: [{ id: 1, label: 'Math', start_time: '09:00:00', end_time: '10:00:00' }],
    }
    useAlarmStore.getState().setAlarms(mockAlarms)
    expect(useAlarmStore.getState().alarms.Monday).toHaveLength(1)
    expect(useAlarmStore.getState().alarms.Monday[0].label).toBe('Math')
  })

  it('resets alarms to initial state via resetAlarms action', () => {
    useAlarmStore.getState().setAlarms({
      Monday: [{ id: 1, label: 'Math' }],
    })
    expect(useAlarmStore.getState().alarms.Monday).toHaveLength(1)

    useAlarmStore.getState().resetAlarms()
    expect(useAlarmStore.getState().alarms.Monday).toEqual([])
  })
})
