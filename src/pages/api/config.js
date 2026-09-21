import createClient from '@/supabase/api'
import { getAppConfig } from '@/services/configService'
import { applyRateLimit } from '@/services/rateLimitService'

export default async function handler(req, res) {
  if (!(await applyRateLimit(req, res, { limit: 100, windowMs: 60_000 }))) return;

  const { method } = req
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${method} Not Allowed`)
  }

  try {
    const supabase = createClient(req, res)
    const config = await getAppConfig(supabase)
    
    // Omit sensitive server-side fields
    const { blocked_magic_link_domains, ...clientConfig } = config;

    return res.status(200).json(clientConfig)
  } catch (error) {
    console.error('GET /api/config error:', error)
    return res.status(500).json({ error: error.message })
  }
}
