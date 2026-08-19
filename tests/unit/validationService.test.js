import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  validateTime,
  validateDayOfWeek,
  validatePositiveInt,
  validateUUID,
  validateEmail,
} from '@/services/validationService'

describe('validationService', () => {
  describe('sanitizeString', () => {
    it('strips HTML tags and trims whitespace', () => {
      const dirty = '  <script>alert("hack")</script> Math Class <b>1</b>  '
      expect(sanitizeString(dirty)).toBe('alert("hack") Math Class 1')
    })

    it('enforces maximum character length', () => {
      const longString = 'a'.repeat(60)
      expect(sanitizeString(longString, 50)).toHaveLength(50)
    })

    it('strips nested and malformed HTML tags completely', () => {
      const nested = '<<script>script>alert("hack")<</script>/script> Math Class'
      expect(sanitizeString(nested)).not.toContain('<')
      expect(sanitizeString(nested)).not.toContain('>')
      expect(sanitizeString(nested)).toBe('alert("hack") Math Class')
    })

    it('handles null, undefined, or empty inputs cleanly', () => {
      expect(sanitizeString(null)).toBe('')
      expect(sanitizeString()).toBe('')
      expect(sanitizeString('')).toBe('')
    })
  })

  describe('validateTime', () => {
    it('accepts valid HH:MM and HH:MM:SS format', () => {
      expect(validateTime('00:00')).toBe(true)
      expect(validateTime('09:30')).toBe(true)
      expect(validateTime('23:59')).toBe(true)
      expect(validateTime('09:30:00')).toBe(true)
      expect(validateTime('23:59:59')).toBe(true)
    })

    it('rejects invalid time formats', () => {
      expect(validateTime('24:00')).toBe(false)
      expect(validateTime('12:60')).toBe(false)
      expect(validateTime('9:5')).toBe(false)
      expect(validateTime('abc')).toBe(false)
      expect(validateTime('')).toBe(false)
      expect(validateTime(null)).toBe(false)
    })
  })

  describe('validateDayOfWeek', () => {
    it('validates day numbers 0-6 or standard day names', () => {
      expect(validateDayOfWeek(0)).toBe(true)
      expect(validateDayOfWeek(6)).toBe(true)
      expect(validateDayOfWeek('Monday')).toBe(true)
      expect(validateDayOfWeek('Sunday')).toBe(true)
    })

    it('rejects invalid day numbers or names', () => {
      expect(validateDayOfWeek(-1)).toBe(false)
      expect(validateDayOfWeek(7)).toBe(false)
      expect(validateDayOfWeek('Funday')).toBe(false)
      expect(validateDayOfWeek(null)).toBe(false)
    })
  })

  describe('validatePositiveInt', () => {
    it('accepts positive integers and numeric strings', () => {
      expect(validatePositiveInt(1)).toBe(true)
      expect(validatePositiveInt('42')).toBe(true)
      expect(validatePositiveInt(100)).toBe(true)
    })

    it('rejects non-integers, zeros, negatives, and non-numeric strings', () => {
      expect(validatePositiveInt(0)).toBe(false)
      expect(validatePositiveInt(-5)).toBe(false)
      expect(validatePositiveInt(3.14)).toBe(false)
      expect(validatePositiveInt('abc')).toBe(false)
      expect(validatePositiveInt(null)).toBe(false)
    })
  })

  describe('validateUUID', () => {
    it('accepts standard v4 UUIDs', () => {
      expect(validateUUID('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')).toBe(true)
      expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    })

    it('rejects malformed UUIDs', () => {
      expect(validateUUID('not-a-uuid')).toBe(false)
      expect(validateUUID('12345')).toBe(false)
      expect(validateUUID('')).toBe(false)
      expect(validateUUID(null)).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('accepts standard email addresses', () => {
      expect(validateEmail('teacher@school.edu')).toBe(true)
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(validateEmail('not-an-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null)).toBe(false)
    })
  })
})
