const rateLimitStore = new Map()

/**
 * Extracts client IP from request headers or socket.
 */
export function getClientIp(req) {
  if (!req) return '127.0.0.1'
  const forwarded = req.headers?.['x-forwarded-for']
  if (forwarded) {
    return String(forwarded).split(',', 1)[0].trim()
  }
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1'
}

/**
 * Evaluates rate limit against in-memory sliding window store.
 */
export function checkRateLimit(identifier, { limit = 100, windowMs = 60_000 } = {}) {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (record && now < record.resetTimeMs) {
    record.count += 1
    if (record.count > limit) {
      return {
        isAllowed: false,
        remaining: 0,
        resetTimeMs: record.resetTimeMs,
      }
    }
    return {
      isAllowed: true,
      remaining: limit - record.count,
      resetTimeMs: record.resetTimeMs,
    }
  }

  const resetTimeMs = now + windowMs
  rateLimitStore.set(identifier, { count: 1, resetTimeMs })

  // Clean up any stale entries periodically
  if (rateLimitStore.size > 10_000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now >= value.resetTimeMs) {
        rateLimitStore.delete(key)
      }
    }
  }

  return {
    isAllowed: true,
    remaining: limit - 1,
    resetTimeMs,
  }
}

/**
 * Express/Next.js API route middleware helper.
 * Returns true if request is within limits, false (and sends 429) if exceeded.
 */
export function applyRateLimit(req, res, { limit = 100, windowMs = 60_000 } = {}) {
  const ip = getClientIp(req)
  const result = checkRateLimit(ip, { limit, windowMs })

  if (res && typeof res.setHeader === 'function') {
    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining))
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTimeMs / 1000))
  }

  if (!result.isAllowed) {
    if (res && typeof res.setHeader === 'function') {
      const retryAfterSeconds = Math.max(1, Math.ceil((result.resetTimeMs - Date.now()) / 1000))
      res.setHeader('Retry-After', retryAfterSeconds)
    }
    if (res && typeof res.status === 'function') {
      res.status(429).json({ error: 'Too many requests. Please try again later.' })
    }
    return false
  }

  return true
}

/**
 * Resets the in-memory store (primarily for unit tests).
 */
export function resetRateLimits() {
  rateLimitStore.clear()
}
