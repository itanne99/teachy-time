import { describe, it, expect, beforeEach } from 'vitest'
import { useScheduleStore } from '@/services/stores/useScheduleStore'

describe('useScheduleStore', () => {
  beforeEach(() => {
    useScheduleStore.getState().resetSchedules()
  })

  it('initializes with default schedule state', () => {
    const state = useScheduleStore.getState()
    expect(state.schedules).toEqual([])
    expect(state.currentScheduleId).toBeNull()
  })

  it('sets schedules and currentScheduleId correctly', () => {
    const mockSchedules = [
      { id: 1, name: 'Term 1' },
      { id: 2, name: 'Term 2' },
    ]
    useScheduleStore.getState().setSchedules(mockSchedules)
    useScheduleStore.getState().setCurrentScheduleId(2)

    expect(useScheduleStore.getState().schedules).toHaveLength(2)
    expect(useScheduleStore.getState().currentScheduleId).toBe(2)
  })

  it('resets schedules to initial state via resetSchedules', () => {
    useScheduleStore.getState().setSchedules([{ id: 1, name: 'Term 1' }])
    useScheduleStore.getState().setCurrentScheduleId(1)

    useScheduleStore.getState().resetSchedules()
    expect(useScheduleStore.getState().schedules).toEqual([])
    expect(useScheduleStore.getState().currentScheduleId).toBeNull()
  })
})
