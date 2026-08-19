import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/auth/passwordRecovery'
import { createApiRequest } from '../../helpers/mockRequest'
import createClient from '@/supabase/api'

vi.mock('@/supabase/api')

describe('API Route: /api/auth/passwordRecovery', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 405 for non-POST/PATCH methods', async () => {
    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
  })

  it('returns 400 when email is missing on POST', async () => {
    const { req, res } = createApiRequest({ method: 'POST', body: {} })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Missing required field: email.' })
  })

  it('returns 200 on successful password reset dispatch', async () => {
    const mockSupabase = {
      auth: {
        resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({
      method: 'POST',
      body: { email: 'teacher@school.edu' },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData().message).toBe('Password reset email sent successfully.')
  })
})
