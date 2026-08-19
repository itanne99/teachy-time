import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/auth/user'
import { createApiRequest } from '../../helpers/mockRequest'
import createClient from '@/supabase/api'
import { resetRateLimits } from '@/services/rateLimitService'

vi.mock('@/supabase/api')

describe('API Route: /api/auth/user', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetRateLimits()
  })

  it('returns active session data on GET', async () => {
    const mockSession = { user: { id: 'u-123', email: 'teacher@school.edu' } }
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual({ session: mockSession })
  })

  it('returns 400 when missing credentials on POST', async () => {
    const { req, res } = createApiRequest({ method: 'POST', body: { user_email: 'test@example.com' } })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(res._getJSONData().error).toMatch(/Missing required fields/i)
  })

  it('returns 200 on successful sign-in with password', async () => {
    const mockAuthData = { user: { id: 'u-123' }, session: { access_token: 'tok' } }
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: mockAuthData, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({
      method: 'POST',
      body: { user_email: 'teacher@school.edu', password: 'password123' },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual(mockAuthData)
  })

  it('returns 200 on DELETE sign out', async () => {
    const mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'DELETE' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
  })
})
