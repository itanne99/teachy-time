import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/alarms'
import { createApiRequest } from '../helpers/mockRequest'
import createClient from '@/supabase/api'
import { resetRateLimits } from '@/services/rateLimitService'

vi.mock('@/supabase/api')

describe('API Route: /api/alarms', () => {
  let mockSupabase

  beforeEach(() => {
    vi.restoreAllMocks()
    resetRateLimits()
  })

  it('returns 401 when user is unauthenticated', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'POST', body: { schedule_id: 1 } })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    expect(res._getJSONData()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 400 when schedule_id is missing or invalid in POST', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'POST', body: {} })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(res._getJSONData().error).toMatch(/Schedule ID/i)
  })

  it('returns formatted alarms grouped by day of week on POST with schedule_id', async () => {
    const rawAlarms = [
      {
        id: 1,
        label: 'Math Class',
        day_of_week: 1, // Monday
        start_time: '09:00:00',
        end_time: '09:45:00',
        user_id: 'u-123',
        schedule_id: 1,
        play_sound: true,
        sound_id: 'snd-1',
        play_warning_sound: false,
        warning_sound_id: null,
        alarm_sounds: { storage_url: 'https://example.com/sound.mp3' },
      },
    ]

    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: rawAlarms, error: null }),
    }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
      from: vi.fn().mockReturnValue(queryBuilder),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'POST', body: { schedule_id: 1 } })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const json = res._getJSONData()
    expect(json.Monday).toHaveLength(1)
    expect(json.Monday[0].label).toBe('Math Class')
    expect(json.Monday[0].sound_url).toBe('https://example.com/sound.mp3')
    expect(json.Tuesday).toEqual([])
  })

  it('returns 400 on PUT when required fields are missing or invalid', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'PUT', body: { label: 'Invalid' } })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
  })

  it('rejects PUT with invalid time format', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({
      method: 'PUT',
      body: {
        day_of_week: 1,
        start_time: '25:00',
        end_time: '26:00',
        label: 'Bad Time',
        schedule_id: 1,
      },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(res._getJSONData().error).toMatch(/Invalid time format/i)
  })
})
