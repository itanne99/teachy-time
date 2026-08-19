// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render, act } from '@testing-library/react'
import UpcomingAlarmBar from '@/components/UpcomingAlarm/UpcomingAlarmBar'
import { useAudioStore } from '@/services/stores/useAudioStore'

describe('UpcomingAlarmBar Audio Triggering Lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useAudioStore.setState({
      audioSrc: '',
      isPlaying: false,
      userSounds: [],
      defaultSound: null,
      warningLeadMinutes: 3,
      warningChimeId: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('triggers audio exactly once when an active timer naturally expires', () => {
    // Current time: 09:59:58 AM on Wednesday (Aug 19, 2026)
    const baseDate = new Date(2026, 7, 19, 9, 59, 58)
    vi.setSystemTime(baseDate)

    const alarms = [
      {
        id: 101,
        day_of_week: 3, // Wednesday
        start_time: '09:00:00',
        end_time: '10:00:00',
        label: 'Math Class',
        play_sound: true,
      },
    ]

    render(<UpcomingAlarmBar alarms={alarms} />)

    // Initial check: not playing yet
    expect(useAudioStore.getState().isPlaying).toBe(false)

    // Advance 1 second -> 09:59:59 (still active)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(useAudioStore.getState().isPlaying).toBe(false)

    // Advance 2 seconds -> 10:00:01 (alarm ended)
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Should have triggered playback
    expect(useAudioStore.getState().isPlaying).toBe(true)

    // Reset store playing state manually to verify it does not trigger a second time
    useAudioStore.setState({ isPlaying: false })
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(useAudioStore.getState().isPlaying).toBe(false)
  })

  it('does NOT trigger audio when switching days or updating alarms prop', () => {
    const baseDate = new Date(2026, 7, 19, 9, 30, 0)
    vi.setSystemTime(baseDate)

    const mondayAlarms = [
      {
        id: 101,
        day_of_week: 1,
        start_time: '09:00:00',
        end_time: '10:00:00',
        label: 'Monday Math',
        play_sound: true,
      },
    ]

    const tuesdayAlarms = [
      {
        id: 202,
        day_of_week: 2,
        start_time: '09:00:00',
        end_time: '10:00:00',
        label: 'Tuesday English',
        play_sound: true,
      },
    ]

    const { rerender } = render(<UpcomingAlarmBar alarms={mondayAlarms} />)
    expect(useAudioStore.getState().isPlaying).toBe(false)

    // Switch to Tuesday alarms prop
    rerender(<UpcomingAlarmBar alarms={tuesdayAlarms} />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Must NOT fire spurious chime
    expect(useAudioStore.getState().isPlaying).toBe(false)
  })

  it('does NOT trigger audio if alarm has play_sound set to false', () => {
    const baseDate = new Date(2026, 7, 19, 9, 59, 58)
    vi.setSystemTime(baseDate)

    const alarms = [
      {
        id: 102,
        day_of_week: 3,
        start_time: '09:00:00',
        end_time: '10:00:00',
        label: 'Silent Reading',
        play_sound: false,
      },
    ]

    render(<UpcomingAlarmBar alarms={alarms} />)

    // Advance past end time
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(useAudioStore.getState().isPlaying).toBe(false)
  })

  it('triggers warning chime once when entering warning lead window', () => {
    // End time 10:00:00, warning lead 3 min -> warning threshold 09:57:00
    const baseDate = new Date(2026, 7, 19, 9, 56, 58)
    vi.setSystemTime(baseDate)

    const alarms = [
      {
        id: 103,
        day_of_week: 3,
        start_time: '09:00:00',
        end_time: '10:00:00',
        label: 'Science Lab',
        play_sound: true,
        play_warning_sound: true,
      },
    ]

    render(<UpcomingAlarmBar alarms={alarms} />)
    expect(useAudioStore.getState().isPlaying).toBe(false)

    // Advance 3 seconds -> 09:57:01 (inside warning threshold)
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(useAudioStore.getState().isPlaying).toBe(true)

    // Reset playing state and ensure it does not fire warning repeatedly
    useAudioStore.setState({ isPlaying: false })
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(useAudioStore.getState().isPlaying).toBe(false)
  })
})
