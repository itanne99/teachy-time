import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '@/pages/api/config'
import { createApiRequest } from '../helpers/mockRequest'
import createClient from '@/supabase/api'

vi.mock('@/supabase/api')

describe('API Route: /api/config', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 405 for non-GET methods', async () => {
    const { req, res } = createApiRequest({ method: 'POST' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
  })

  it('returns application configuration on GET', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            { key: 'max_sounds_per_user', value: '15' },
            { key: 'Account_Creation', value: 'true' },
          ],
          error: null,
        }),
      }),
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase)

    const { req, res } = createApiRequest({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const json = res._getJSONData()
    expect(json.max_sounds_per_user).toBe(15)
    expect(json.Account_Creation).toBe(true)
  })
})
