import { useAlarmStore } from './stores/useAlarmStore'
import { useScheduleStore } from './stores/useScheduleStore'
import { useAuthStore } from './stores/useAuthStore'
import { useAudioStore } from './stores/useAudioStore'
import { useConfigStore } from './stores/useConfigStore'

export { useAlarmStore } from './stores/useAlarmStore'
export { useScheduleStore } from './stores/useScheduleStore'
export { useAuthStore } from './stores/useAuthStore'
export { useAudioStore } from './stores/useAudioStore'
export { useConfigStore } from './stores/useConfigStore'

/**
 * Composite backward-compatible hook.
 * For optimal performance, prefer importing the domain-specific hooks directly:
 * `useAlarmStore`, `useScheduleStore`, `useAuthStore`, `useAudioStore`, `useConfigStore`.
 */
export function useStore(selector) {
  const alarmState = useAlarmStore()
  const scheduleState = useScheduleStore()
  const authState = useAuthStore()
  const audioState = useAudioStore()
  const configState = useConfigStore()

  const combinedState = {
    ...alarmState,
    ...scheduleState,
    ...authState,
    ...audioState,
    ...configState,
  }

  return selector ? selector(combinedState) : combinedState
}

useStore.getState = () => ({
  ...useAlarmStore.getState(),
  ...useScheduleStore.getState(),
  ...useAuthStore.getState(),
  ...useAudioStore.getState(),
  ...useConfigStore.getState(),
})

const alarmKeys = new Set(['alarms'])
const scheduleKeys = new Set(['schedules', 'currentScheduleId'])
const authKeys = new Set(['user', 'session', 'authSuccessMessage', 'forceLoginOpen', 'authModalOpen', 'authModalView', 'passwordResetFlag'])
const audioKeys = new Set(['audioSrc', 'isPlaying', 'userSounds', 'defaultSound', 'warningLeadMinutes', 'warningChimeId'])
const configKeys = new Set(['maxLabelLength', 'maxScheduleNameLength', 'defaultChimeUrl', 'defaultWarningChimeUrl', 'Account_Creation', 'blocked_magic_link_domains'])

useStore.setState = (partialState) => {
  const alarmUpdates = {}
  const scheduleUpdates = {}
  const authUpdates = {}
  const audioUpdates = {}
  const configUpdates = {}

  Object.entries(partialState).forEach(([key, value]) => {
    if (alarmKeys.has(key)) alarmUpdates[key] = value
    else if (scheduleKeys.has(key)) scheduleUpdates[key] = value
    else if (authKeys.has(key)) authUpdates[key] = value
    else if (audioKeys.has(key)) audioUpdates[key] = value
    else if (configKeys.has(key)) configUpdates[key] = value
    else configUpdates[key] = value
  })

  if (Object.keys(alarmUpdates).length > 0) useAlarmStore.setState(alarmUpdates)
  if (Object.keys(scheduleUpdates).length > 0) useScheduleStore.setState(scheduleUpdates)
  if (Object.keys(authUpdates).length > 0) useAuthStore.setState(authUpdates)
  if (Object.keys(audioUpdates).length > 0) useAudioStore.setState(audioUpdates)
  if (Object.keys(configUpdates).length > 0) useConfigStore.setState(configUpdates)
}

useStore.subscribe = (listener) => {
  const unsub1 = useAlarmStore.subscribe(listener)
  const unsub2 = useScheduleStore.subscribe(listener)
  const unsub3 = useAuthStore.subscribe(listener)
  const unsub4 = useAudioStore.subscribe(listener)
  const unsub5 = useConfigStore.subscribe(listener)
  return () => {
    unsub1()
    unsub2()
    unsub3()
    unsub4()
    unsub5()
  }
}
