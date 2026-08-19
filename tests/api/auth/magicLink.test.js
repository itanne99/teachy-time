import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/auth/magicLink'
import { createApiRequest } from '../../helpers/mockRequest'
import createClient from '@/supabase/api'

vi.mock('@/supabase/api')

describe('API Route: /api/auth/magicLink', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 405 for non-POST methods', async () => {
    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
  })

  it('returns 400 when email is missing', async () => {
    const { req, res } = createApiRequest({ method: 'POST', body: {} })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Missing required field: email.' })
  })

  it('returns 403 when email domain is in blocked list', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ key: 'blocked_magic_link_domains', value: '["@tempmail.com"]' }],
          error: null,
        }),
      }),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({
      method: 'POST',
      body: { email: 'user@tempmail.com' },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(403)
    expect(res._getJSONData()).toEqual({ error: 'Email domain not allowed for magic link login.' })
  })

  it('returns 200 on successful magic link dispatch', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
      auth: {
        signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({
      method: 'POST',
      body: { email: 'teacher@school.edu' },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual({ message: 'Magic link sent successfully.' })
  })
})
