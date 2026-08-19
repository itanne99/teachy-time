import { describe, it, expect } from 'vitest'
import CommonUtils from '@/services/CommonUtils'

describe('CommonUtils', () => {
  describe('formatTime', () => {
    it('formats 24-hour time string into readable 12-hour AM/PM string', () => {
      expect(CommonUtils.formatTime('09:30:00')).toBe('09:30 AM')
      expect(CommonUtils.formatTime('13:45:00')).toBe('01:45 PM')
      expect(CommonUtils.formatTime('00:00:00')).toBe('12:00 AM')
      expect(CommonUtils.formatTime('12:00:00')).toBe('12:00 PM')
      expect(CommonUtils.formatTime('23:59:59')).toBe('11:59 PM')
    })

    it('handles empty or invalid inputs gracefully', () => {
      expect(CommonUtils.formatTime('')).toBe('')
      expect(CommonUtils.formatTime(null)).toBe('')
      expect(CommonUtils.formatTime()).toBe('')
    })
  })

  describe('getCurrentDay', () => {
    it('returns a valid day of the week string', () => {
      const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const day = CommonUtils.getCurrentDay()
      expect(validDays).toContain(day)
    })
  })

  describe('isNullOrWhitespace', () => {
    it('identifies null, undefined, empty, or whitespace strings', () => {
      expect(CommonUtils.isNullOrWhitespace(null)).toBe(true)
      expect(CommonUtils.isNullOrWhitespace()).toBe(true)
      expect(CommonUtils.isNullOrWhitespace('')).toBe(true)
      expect(CommonUtils.isNullOrWhitespace(' '.repeat(3))).toBe(true)
      expect(CommonUtils.isNullOrWhitespace('hello')).toBe(false)
      expect(CommonUtils.isNullOrWhitespace('  text  ')).toBe(false)
    })
  })
})
