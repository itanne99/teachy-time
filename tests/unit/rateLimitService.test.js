import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkRateLimit,
  applyRateLimit,
  resetRateLimits,
} from '@/services/rateLimitService'

describe('rateLimitService', () => {
  beforeEach(() => {
    resetRateLimits()
    vi.useRealTimers()
  })

  it('allows requests within the specified limit', () => {
    const ip = '192.168.1.1'
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(ip, { limit: 5, windowMs: 60_000 })
      expect(result.isAllowed).toBe(true)
      expect(result.remaining).toBe(4 - i)
    }
  })

  it('throttles requests when limit is exceeded', () => {
    const ip = '192.168.1.2'
    for (let i = 0; i < 3; i++) {
      checkRateLimit(ip, { limit: 3, windowMs: 60_000 })
    }

    const blocked = checkRateLimit(ip, { limit: 3, windowMs: 60_000 })
    expect(blocked.isAllowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('resets quota after windowMs has elapsed', () => {
    vi.useFakeTimers()
    const ip = '192.168.1.3'

    for (let i = 0; i < 2; i++) {
      checkRateLimit(ip, { limit: 2, windowMs: 1000 })
    }
    expect(checkRateLimit(ip, { limit: 2, windowMs: 1000 }).isAllowed).toBe(false)

    // Advance 1.1s past the window
    vi.advanceTimersByTime(1100)

    const fresh = checkRateLimit(ip, { limit: 2, windowMs: 1000 })
    expect(fresh.isAllowed).toBe(true)
    expect(fresh.remaining).toBe(1)
  })

  it('applyRateLimit sets HTTP headers and sends 429 response when throttled', () => {
    const req = {
      headers: { 'x-forwarded-for': '203.0.113.195' },
      socket: { remoteAddress: '127.0.0.1' },
    }

    let statusCode = null
    let responseBody = null
    const headersSet = {}

    const res = {
      setHeader: (key, val) => {
        headersSet[key] = val
      },
      status: (code) => {
        statusCode = code
        return {
          json: (data) => {
            responseBody = data
          },
        }
      },
    }

    // Call 2 times with limit 2 -> should succeed
    expect(applyRateLimit(req, res, { limit: 2, windowMs: 60_000 })).toBe(true)
    expect(applyRateLimit(req, res, { limit: 2, windowMs: 60_000 })).toBe(true)

    // 3rd call -> should be throttled
    const isAllowed = applyRateLimit(req, res, { limit: 2, windowMs: 60_000 })
    expect(isAllowed).toBe(false)
    expect(statusCode).toBe(429)
    expect(responseBody).toEqual({ error: 'Too many requests. Please try again later.' })
    expect(headersSet['X-RateLimit-Limit']).toBe(2)
    expect(headersSet['X-RateLimit-Remaining']).toBe(0)
    expect(headersSet['Retry-After']).toBeDefined()
  })
})
