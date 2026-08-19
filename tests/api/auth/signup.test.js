import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/auth/signup'
import { createApiRequest } from '../../helpers/mockRequest'
import createClient from '@/supabase/api'

vi.mock('@/supabase/api')

describe('API Route: /api/auth/signup', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 405 for non-POST methods', async () => {
    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
  })

  it('returns 403 when Account_Creation is disabled in config', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ key: 'Account_Creation', value: 'false' }],
          error: null,
        }),
      }),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({
      method: 'POST',
      body: { email: 'teacher@school.org', password: 'secretpassword', full_name: 'Jane Doe' },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(403)
    expect(res._getJSONData()).toEqual({ error: 'Account creation is currently disabled.' })
  })

  it('returns 400 when required fields are missing', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ key: 'Account_Creation', value: 'true' }],
          error: null,
        }),
      }),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({
      method: 'POST',
      body: { email: 'teacher@school.org' }, // missing password & full_name
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
  })

  it('returns 200 on successful user sign up', async () => {
    const mockUser = { id: 'u-new', email: 'teacher@school.org' }
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ key: 'Account_Creation', value: 'true' }],
          error: null,
        }),
      }),
      auth: {
        signUp: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({
      method: 'POST',
      body: { email: 'teacher@school.org', password: 'securepassword123', full_name: 'Jane Doe' },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual({ user: mockUser })
  })
})
