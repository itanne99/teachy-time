import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAppConfig } from '@/services/configService'

describe('configService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches config and parses numeric, boolean, json array, and string keys', async () => {
    const mockData = [
      { key: 'max_sounds_per_user', value: '15' },
      { key: 'max_label_length', value: '60' },
      { key: 'max_schedule_name_length', value: '120' },
      { key: 'Account_Creation', value: 'true' },
      { key: 'blocked_magic_link_domains', value: '["tempmail.com", "throwaway.email"]' },
      { key: 'default_chime_url', value: 'https://example.com/custom.mp3' },
    ]

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    }

    const config = await getAppConfig(mockSupabase)
    expect(config.max_sounds_per_user).toBe(15)
    expect(config.max_label_length).toBe(60)
    expect(config.max_schedule_name_length).toBe(120)
    expect(config.Account_Creation).toBe(true)
    expect(config.blocked_magic_link_domains).toEqual(['tempmail.com', 'throwaway.email'])
    expect(config.default_chime_url).toBe('https://example.com/custom.mp3')
  })

  it('returns default fallback object when query returns error or null', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      }),
    }

    const config = await getAppConfig(mockSupabase)
    expect(config).toBeDefined()
    expect(config.max_sounds_per_user).toBe(10)
    expect(config.Account_Creation).toBe(false)
    expect(config.blocked_magic_link_domains).toEqual([])
  })

  it('handles invalid JSON gracefully for json array keys', async () => {
    const mockData = [
      { key: 'blocked_magic_link_domains', value: 'not-valid-json{' },
    ]

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    }

    const config = await getAppConfig(mockSupabase)
    expect(config.blocked_magic_link_domains).toEqual([])
  })
})
