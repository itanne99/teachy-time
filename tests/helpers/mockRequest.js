import { createMocks } from 'node-mocks-http'

export function createApiRequest(options = {}) {
  const { method = 'GET', body = {}, query = {}, headers = {}, cookies = {} } = options

  return createMocks({
    method,
    body,
    query,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    cookies,
  })
}
