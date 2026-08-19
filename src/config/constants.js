export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export const API_ENDPOINTS = {
  ALARMS: '/api/alarms',
  SCHEDULES: '/api/schedules',
  USER_PROFILE: '/api/userProfile',
  ALARM_SOUNDS: '/api/alarmSounds',
  AUTH_USER: '/api/auth/user',
  AUTH_PASSWORD_RECOVERY: '/api/auth/passwordRecovery',
  CONFIG: '/api/config'
}

export const DEFAULT_CHIME_URL = process.env.NEXT_PUBLIC_DEFAULT_CHIME_URL || 'https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/wind-chimes-37762.mp3'
export const DEFAULT_WARNING_CHIME_URL = 'https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/gentle-ding.mp3'

export const MAX_LABEL_LENGTH = 50
export const MAX_SCHEDULE_NAME_LENGTH = 100
