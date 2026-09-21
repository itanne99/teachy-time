import { Redis } from '@upstash/redis'

const hasRedis = !!process.env.REDIS_STORAGE_KV_REST_API_URL && !!process.env.REDIS_STORAGE_KV_REST_API_TOKEN

let redis = null
if (hasRedis) {
  redis = new Redis({
    url: process.env.REDIS_STORAGE_KV_REST_API_URL,
    token: process.env.REDIS_STORAGE_KV_REST_API_TOKEN,
  })
}

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
 * Evaluates rate limit using fixed window algorithm with Redis (or fallback to memory).
 */
export async function checkRateLimit(identifier, { limit = 100, windowMs = 60_000 } = {}) {
  const now = Date.now()
  const windowId = Math.floor(now / windowMs)
  const key = `ratelimit:${identifier}:${windowId}`
  const resetTimeMs = (windowId + 1) * windowMs

  if (redis) {
    try {
      const p = redis.pipeline()
      p.incr(key)
      p.pexpire(key, windowMs)
      const results = await p.exec()
      const count = results[0]

      if (count > limit) {
        return { isAllowed: false, remaining: 0, resetTimeMs }
      }
      return { isAllowed: true, remaining: limit - count, resetTimeMs }
    } catch (error) {
      console.error('Redis rate limit error:', error)
      // fallback to allow if Redis fails
      return { isAllowed: true, remaining: limit - 1, resetTimeMs }
    }
  }

  // Fallback to in-memory map
  const record = rateLimitStore.get(key)
  if (record) {
    record.count += 1
    if (record.count > limit) {
      return { isAllowed: false, remaining: 0, resetTimeMs }
    }
    return { isAllowed: true, remaining: limit - record.count, resetTimeMs }
  }

  rateLimitStore.set(key, { count: 1 })

  // Clean up stale memory map entries
  if (rateLimitStore.size > 10_000) {
    const threshold = windowId - 1
    for (const [k] of rateLimitStore.entries()) {
      const keyWindow = parseInt(k.split(':').pop())
      if (keyWindow < threshold) {
        rateLimitStore.delete(k)
      }
    }
  }

  return { isAllowed: true, remaining: limit - 1, resetTimeMs }
}

/**
 * Express/Next.js API route middleware helper.
 * Returns true if request is within limits, false (and sends 429) if exceeded.
 */
export async function applyRateLimit(req, res, { limit = 100, windowMs = 60_000 } = {}) {
  const ip = getClientIp(req)
  const result = await checkRateLimit(ip, { limit, windowMs })

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

