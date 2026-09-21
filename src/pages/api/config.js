import createClient from '@/supabase/api'
import { getAppConfig } from '@/services/configService'

export default async function handler(req, res) {
  const { method } = req
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${method} Not Allowed`)
  }

  try {
    const supabase = createClient(req, res)
    const config = await getAppConfig(supabase)
    return res.status(200).json(config)
  } catch (error) {
    console.error('GET /api/config error:', error)
    return res.status(500).json({ error: error.message })
  }
}
