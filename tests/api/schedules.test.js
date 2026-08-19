import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/schedules'
import { createApiRequest } from '../helpers/mockRequest'
import createClient from '@/supabase/api'

vi.mock('@/supabase/api')

describe('API Route: /api/schedules', () => {
  let mockSupabase

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'POST' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })

  it('returns schedules list on POST (listing schedules)', async () => {
    const mockSchedules = [
      { id: 1, user_id: 'u-123', name: 'Main', is_active: true },
      { id: 2, user_id: 'u-123', name: 'Summer Term', is_active: false },
    ]

    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockSchedules, error: null }),
    }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
      from: vi.fn().mockReturnValue(queryBuilder),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'POST' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual(mockSchedules)
  })

  it('returns 400 on PUT when schedule name is missing', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'PUT', body: {} })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Name is required.' })
  })

  it('creates new schedule on PUT with valid name', async () => {
    const createdSchedule = { id: 3, user_id: 'u-123', name: 'Fall 2026', is_active: false }

    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: createdSchedule, error: null }),
    }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
      from: vi.fn().mockReturnValue(queryBuilder),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'PUT', body: { name: 'Fall 2026' } })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    expect(res._getJSONData()).toEqual(createdSchedule)
  })

  it('prevents deleting the Main schedule', async () => {
    const mainSchedule = { id: 1, user_id: 'u-123', name: 'Main' }

    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mainSchedule, error: null }),
    }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
      },
      from: vi.fn().mockReturnValue(queryBuilder),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'DELETE', body: { id: 1 } })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(403)
    expect(res._getJSONData()).toEqual({ error: 'Cannot delete the Main schedule.' })
  })
})
