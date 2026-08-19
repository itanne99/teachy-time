import { DAYS_OF_WEEK } from '@/config/constants'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Strips HTML tags, trims surrounding whitespace, and truncates to maxLength.
 */
export function sanitizeString(str, maxLength = 255) {
  if (str === null || str === undefined) return ''
  const cleaned = String(str).replaceAll(/<[^>]*>/g, '').trim()
  return maxLength ? cleaned.slice(0, maxLength) : cleaned
}

/**
 * Validates 24-hour time format (HH:MM or HH:MM:SS, 00:00 to 23:59:59).
 */
export function validateTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return false
  return TIME_REGEX.test(timeStr.trim())
}

/**
 * Validates day of week (integer 0-6 or valid standard day name).
 */
export function validateDayOfWeek(day) {
  if (day === null || day === undefined) return false
  if (typeof day === 'number') {
    return Number.isInteger(day) && day >= 0 && day <= 6
  }
  if (typeof day === 'string') {
    return DAYS_OF_WEEK.includes(day)
  }
  return false
}

/**
 * Validates positive integer identifier (e.g. database serial ID).
 */
export function validatePositiveInt(id) {
  if ([null, undefined, ''].includes(id)) return false
  const num = Number(id)
  return Number.isInteger(num) && num > 0
}

/**
 * Validates standard UUID format.
 */
export function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false
  return UUID_REGEX.test(uuid.trim())
}

/**
 * Validates standard email address.
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  return EMAIL_REGEX.test(email.trim())
}
