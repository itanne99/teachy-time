/**
 * Alarm Audio Evaluation Service
 *
 * Implements a state-machine tracker to evaluate audio triggers for timer completion
 * and warnings without race conditions or false triggers on day/schedule switches.
 */

/**
 * Creates the initial active alarm tracker state
 * @returns {Object}
 */
export function createInitialAlarmTracker() {
  return {
    alarmId: null,
    segmentStartTimeMs: 0,
    segmentEndTimeMs: 0,
    playSound: true,
    playWarningSound: false,
    soundId: null,
    warningSoundId: null,
    warningTriggered: false,
    endTriggered: false,
    lastEvaluatedTimeMs: 0,
  }
}

/**
 * Evaluates audio trigger conditions on clock tick or alarm transition
 *
 * @param {Object} params
 * @param {Array} [params.alarms] Current day's alarms array
 * @param {Object|null} [params.activeSegment] Current active alarm segment
 * @param {Date|null} [params.segmentStartTime] Start Date of activeSegment
 * @param {Date|null} [params.segmentEndTime] End Date of activeSegment
 * @param {Object} [params.tracker] Current tracker object
 * @param {Date} [params.now] Current Date object
 * @param {number} [params.warningLeadMinutes] Warning threshold in minutes
 * @param {Function} [params.resolveAudioSrc] Function to get end chime URL
 * @param {Function} [params.resolveWarningAudioSrc] Function to get warning chime URL
 * @returns {{ nextTracker: Object, triggeredAudio: { shouldPlay: boolean, audioSrc: string|null, type: 'end'|'warning' } | null }}
 */
export function evaluateAlarmAudioTriggers({
  alarms = [],
  activeSegment = null,
  segmentStartTime = null,
  segmentEndTime = null,
  tracker = createInitialAlarmTracker(),
  now = new Date(),
  warningLeadMinutes = 3,
  resolveAudioSrc = () => null,
  resolveWarningAudioSrc = () => null,
}) {
  const nowMs = now.getTime()
  let triggeredAudio = null

  // Clone tracker to keep updates immutable/predictable
  const nextTracker = { ...tracker }

  // 1. Natural expiration check on the previously tracked active alarm
  if (
    nextTracker.alarmId !== null &&
    !nextTracker.endTriggered &&
    nowMs >= nextTracker.segmentEndTimeMs &&
    nextTracker.lastEvaluatedTimeMs > 0 &&
    nextTracker.lastEvaluatedTimeMs < nextTracker.segmentEndTimeMs &&
    (nowMs - nextTracker.segmentEndTimeMs) < 5000 &&
    nextTracker.playSound !== false
  ) {
    nextTracker.endTriggered = true
    const expiredAlarm = alarms.find((a) => a.id === nextTracker.alarmId) || {
      id: nextTracker.alarmId,
      sound_id: nextTracker.soundId,
      play_sound: nextTracker.playSound,
    }
    const src = resolveAudioSrc(expiredAlarm)
    if (src) {
      triggeredAudio = {
        shouldPlay: true,
        audioSrc: src,
        type: 'end',
      }
    }
  }

  // 2. Warning chime check on currently active segment
  if (
    activeSegment &&
    activeSegment.play_warning_sound &&
    !nextTracker.warningTriggered &&
    segmentEndTime
  ) {
    const warningThresholdMs = (warningLeadMinutes || 3) * 60 * 1000
    const timeUntilEnd = segmentEndTime.getTime() - nowMs
    if (timeUntilEnd > 0 && timeUntilEnd <= warningThresholdMs) {
      nextTracker.warningTriggered = true
      const warningSrc = resolveWarningAudioSrc(activeSegment)
      if (warningSrc) {
        triggeredAudio = {
          shouldPlay: true,
          audioSrc: warningSrc,
          type: 'warning',
        }
      }
    }
  }

  // 3. Update tracker state for the active segment
  if (activeSegment && segmentStartTime && segmentEndTime) {
    const segmentStartMs = segmentStartTime.getTime()
    const segmentEndMs = segmentEndTime.getTime()

    if (nextTracker.alarmId !== activeSegment.id) {
      // New or switched alarm: initialize tracker for the new segment
      nextTracker.alarmId = activeSegment.id
      nextTracker.segmentStartTimeMs = segmentStartMs
      nextTracker.segmentEndTimeMs = segmentEndMs
      nextTracker.playSound = activeSegment.play_sound !== false
      nextTracker.playWarningSound = !!activeSegment.play_warning_sound
      nextTracker.soundId = activeSegment.sound_id || null
      nextTracker.warningSoundId = activeSegment.warning_sound_id || null
      nextTracker.warningTriggered = false
      nextTracker.endTriggered = false
      nextTracker.lastEvaluatedTimeMs = nowMs
    } else {
      nextTracker.segmentStartTimeMs = segmentStartMs
      nextTracker.segmentEndTimeMs = segmentEndMs
      nextTracker.playSound = activeSegment.play_sound !== false
      nextTracker.playWarningSound = !!activeSegment.play_warning_sound
      nextTracker.soundId = activeSegment.sound_id || null
      nextTracker.warningSoundId = activeSegment.warning_sound_id || null
      nextTracker.lastEvaluatedTimeMs = nowMs
    }
  } else {
    // No active alarm currently running: update evaluation time
    nextTracker.lastEvaluatedTimeMs = nowMs
  }

  return { nextTracker, triggeredAudio }
}
