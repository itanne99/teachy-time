/* eslint-disable unicorn/no-thenable */
import { vi } from 'vitest'

export function createMockQueryBuilder(resolvedData = [], resolvedError = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => {
      const data = Array.isArray(resolvedData) ? resolvedData[0] || null : resolvedData
      return Promise.resolve({ data, error: resolvedError })
    }),
    then: vi.fn().mockImplementation((resolve) => {
      return Promise.resolve(resolve({ data: resolvedData, error: resolvedError }))
    }),
  }
  return builder
}

export function createMockSupabase(options = {}) {
  const {
    user = { id: 'test-user-id', email: 'test@example.com' },
    authError = null,
    dbData = [],
    dbError = null,
    storageData = { path: 'test-path.mp3' },
    storageError = null,
  } = options

  const mockQuery = createMockQueryBuilder(dbData, dbError)

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError }),
      signUp: vi.fn().mockResolvedValue({ data: { user }, error: authError }),
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: authError }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: authError }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue(mockQuery),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: storageData, error: storageError }),
        remove: vi.fn().mockResolvedValue({ data: storageData, error: storageError }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/sound.mp3' } }),
      }),
    },
  }
}
