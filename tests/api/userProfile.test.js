import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/userProfile'
import { createApiRequest } from '../helpers/mockRequest'
import createClient from '@/supabase/api'

vi.mock('@/supabase/api')

describe('API Route: /api/userProfile', () => {
  let mockSupabase

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })

  it('returns profile data on GET when found', async () => {
    const mockProfile = {
      user_id: 'u-123',
      first_name: 'Jane',
      last_name: 'Doe',
      default_sound_id: null,
      warning_lead_minutes: 3,
    }

    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
    }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
      from: vi.fn().mockReturnValue(queryBuilder),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual({
      ...mockProfile,
      default_sound_url: null,
      default_preset_sound_id: null,
    })
  })

  it('returns 400 on PATCH when no fields are provided', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'PATCH', body: {} })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
  })
})
