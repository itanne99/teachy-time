import { describe, it, expect } from 'vitest'
import {
  createInitialAlarmTracker,
  evaluateAlarmAudioTriggers,
} from '@/services/alarmAudioService'

describe('alarmAudioService - Audio Trigger State Machine', () => {
  const resolveAudioSrc = (alarm) => `https://example.com/sound-${alarm?.id || 'default'}.mp3`
  const resolveWarningAudioSrc = (alarm) => `https://example.com/warning-${alarm?.id || 'default'}.mp3`

  it('creates clean initial tracker state', () => {
    const tracker = createInitialAlarmTracker()
    expect(tracker.alarmId).toBeNull()
    expect(tracker.endTriggered).toBe(false)
    expect(tracker.warningTriggered).toBe(false)
    expect(tracker.lastEvaluatedTimeMs).toBe(0)
  })

  it('triggers audio exactly once when active timer crosses end time in real time', () => {
    const alarm = {
      id: 101,
      start_time: '09:00:00',
      end_time: '10:00:00',
      label: 'Math Class',
      play_sound: true,
      play_warning_sound: false,
    }
    const alarms = [alarm]

    const startTime = new Date(2026, 7, 19, 9, 0, 0)
    const endTime = new Date(2026, 7, 19, 10, 0, 0)

    // 1. First evaluation at 09:59:58 (2 seconds before end)
    const time1 = new Date(2026, 7, 19, 9, 59, 58)
    const res1 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: alarm,
      segmentStartTime: startTime,
      segmentEndTime: endTime,
      tracker: createInitialAlarmTracker(),
      now: time1,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    expect(res1.triggeredAudio).toBeNull()
    expect(res1.nextTracker.alarmId).toBe(101)
    expect(res1.nextTracker.endTriggered).toBe(false)

    // 2. Second evaluation at 10:00:00 (exact end time crossed)
    const time2 = new Date(2026, 7, 19, 10, 0, 0)
    const res2 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: null, // Segment finished
      segmentStartTime: null,
      segmentEndTime: null,
      tracker: res1.nextTracker,
      now: time2,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    expect(res2.triggeredAudio).not.toBeNull()
    expect(res2.triggeredAudio.type).toBe('end')
    expect(res2.triggeredAudio.audioSrc).toBe('https://example.com/sound-101.mp3')
    expect(res2.nextTracker.endTriggered).toBe(true)

    // 3. Third evaluation at 10:00:01 (subsequent tick)
    const time3 = new Date(2026, 7, 19, 10, 0, 1)
    const res3 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: null,
      segmentStartTime: null,
      segmentEndTime: null,
      tracker: res2.nextTracker,
      now: time3,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    expect(res3.triggeredAudio).toBeNull()
  })

  it('does NOT trigger audio when switching days or changing alarms prop', () => {
    const mondayAlarm = {
      id: 101,
      start_time: '09:00:00',
      end_time: '10:00:00',
      label: 'Monday Math',
      play_sound: true,
    }
    const mondayAlarms = [mondayAlarm]

    const startTime = new Date(2026, 7, 19, 9, 0, 0)
    const endTime = new Date(2026, 7, 19, 10, 0, 0)

    // Active on Monday at 09:30:00
    const time1 = new Date(2026, 7, 19, 9, 30, 0)
    const res1 = evaluateAlarmAudioTriggers({
      alarms: mondayAlarms,
      activeSegment: mondayAlarm,
      segmentStartTime: startTime,
      segmentEndTime: endTime,
      tracker: createInitialAlarmTracker(),
      now: time1,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    expect(res1.triggeredAudio).toBeNull()

    // User switches view to Tuesday (where no alarm is active or Tuesday alarm 202 is active)
    const tuesdayAlarm = {
      id: 202,
      start_time: '09:00:00',
      end_time: '10:00:00',
      label: 'Tuesday English',
      play_sound: true,
    }
    const tuesdayAlarms = [tuesdayAlarm]

    const res2 = evaluateAlarmAudioTriggers({
      alarms: tuesdayAlarms,
      activeSegment: tuesdayAlarm,
      segmentStartTime: startTime,
      segmentEndTime: endTime,
      tracker: res1.nextTracker,
      now: time1,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    // Must NOT fire audio
    expect(res2.triggeredAudio).toBeNull()
    expect(res2.nextTracker.alarmId).toBe(202)
    expect(res2.nextTracker.endTriggered).toBe(false)
  })

  it('does NOT trigger audio when alarm has play_sound set to false', () => {
    const alarm = {
      id: 102,
      start_time: '09:00:00',
      end_time: '10:00:00',
      label: 'Silent Reading',
      play_sound: false,
    }
    const alarms = [alarm]

    const startTime = new Date(2026, 7, 19, 9, 0, 0)
    const endTime = new Date(2026, 7, 19, 10, 0, 0)

    const time1 = new Date(2026, 7, 19, 9, 59, 59)
    const res1 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: alarm,
      segmentStartTime: startTime,
      segmentEndTime: endTime,
      tracker: createInitialAlarmTracker(),
      now: time1,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    const time2 = new Date(2026, 7, 19, 10, 0, 1)
    const res2 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: null,
      segmentStartTime: null,
      segmentEndTime: null,
      tracker: res1.nextTracker,
      now: time2,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    expect(res2.triggeredAudio).toBeNull()
  })

  it('triggers warning chime once when entering warning lead window', () => {
    const alarm = {
      id: 103,
      start_time: '09:00:00',
      end_time: '10:00:00',
      label: 'Science Lab',
      play_sound: true,
      play_warning_sound: true,
    }
    const alarms = [alarm]

    const startTime = new Date(2026, 7, 19, 9, 0, 0)
    const endTime = new Date(2026, 7, 19, 10, 0, 0)

    // Warning lead: 3 minutes -> Threshold is 09:57:00
    // Time at 09:56:00 (outside window)
    const time1 = new Date(2026, 7, 19, 9, 56, 0)
    const res1 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: alarm,
      segmentStartTime: startTime,
      segmentEndTime: endTime,
      tracker: createInitialAlarmTracker(),
      now: time1,
      warningLeadMinutes: 3,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })
    expect(res1.triggeredAudio).toBeNull()
    expect(res1.nextTracker.warningTriggered).toBe(false)

    // Time at 09:57:01 (inside window)
    const time2 = new Date(2026, 7, 19, 9, 57, 1)
    const res2 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: alarm,
      segmentStartTime: startTime,
      segmentEndTime: endTime,
      tracker: res1.nextTracker,
      now: time2,
      warningLeadMinutes: 3,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })
    expect(res2.triggeredAudio).not.toBeNull()
    expect(res2.triggeredAudio.type).toBe('warning')
    expect(res2.triggeredAudio.audioSrc).toBe('https://example.com/warning-103.mp3')
    expect(res2.nextTracker.warningTriggered).toBe(true)

    // Subsequent tick inside window
    const time3 = new Date(2026, 7, 19, 9, 58, 0)
    const res3 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: alarm,
      segmentStartTime: startTime,
      segmentEndTime: endTime,
      tracker: res2.nextTracker,
      now: time3,
      warningLeadMinutes: 3,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })
    expect(res3.triggeredAudio).toBeNull()
  })

  it('does NOT trigger chime if waking from suspension > 5 seconds past end time', () => {
    const alarm = {
      id: 104,
      start_time: '09:00:00',
      end_time: '10:00:00',
      label: 'Old Class',
      play_sound: true,
    }
    const alarms = [alarm]

    const startTime = new Date(2026, 7, 19, 9, 0, 0)
    const endTime = new Date(2026, 7, 19, 10, 0, 0)

    // Last evaluated at 09:55:00
    const time1 = new Date(2026, 7, 19, 9, 55, 0)
    const res1 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: alarm,
      segmentStartTime: startTime,
      segmentEndTime: endTime,
      tracker: createInitialAlarmTracker(),
      now: time1,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    // Laptop woke up at 10:15:00 (15 minutes late)
    const time2 = new Date(2026, 7, 19, 10, 15, 0)
    const res2 = evaluateAlarmAudioTriggers({
      alarms,
      activeSegment: null,
      segmentStartTime: null,
      segmentEndTime: null,
      tracker: res1.nextTracker,
      now: time2,
      resolveAudioSrc,
      resolveWarningAudioSrc,
    })

    // Must be suppressed
    expect(res2.triggeredAudio).toBeNull()
  })
})
