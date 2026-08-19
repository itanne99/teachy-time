import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/alarmSounds'
import { createApiRequest } from '../helpers/mockRequest'
import createClient from '@/supabase/api'
import { resetRateLimits } from '@/services/rateLimitService'

vi.mock('@/supabase/api')
vi.mock('@/supabase/supabaseService', () => ({
  default: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/chime.mp3' } }),
      }),
    },
  },
}))

describe('API Route: /api/alarmSounds', () => {
  let mockSupabase

  beforeEach(() => {
    vi.restoreAllMocks()
    resetRateLimits()
  })

  it('returns 401 when unauthenticated', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })

  it('returns sounds list and default sound ID on GET', async () => {
    const mockSounds = [
      { id: 'snd-1', name: 'School Bell', storage_url: 'https://example.com/bell.mp3' }
    ]

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
      from: vi.fn().mockImplementation((table) => {
        if (table === 'alarm_sounds') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockSounds, error: null }),
          }
        }
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { default_sound_id: 'snd-1' }, error: null }),
          }
        }
        if (table === 'app_config') {
          return {
            select: vi.fn().mockResolvedValue({ data: [{ key: 'max_sounds_per_user', value: '10' }], error: null }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        }
      }),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual({
      sounds: mockSounds,
      defaultSoundId: 'snd-1',
      maxSounds: 10,
    })
  })

  it('returns 400 on POST with missing fields', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'POST', body: { name: 'Bell' } })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
  })
})
