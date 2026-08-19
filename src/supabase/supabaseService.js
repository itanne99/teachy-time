import { createClient } from '@supabase/supabase-js'

let supabaseServiceInstance = null
let lastUsedKey = null

function getClient() {
  const currentKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseServiceInstance || lastUsedKey !== currentKey) {
    supabaseServiceInstance = createClient(supabaseUrl, currentKey)
    lastUsedKey = currentKey
  }
  return supabaseServiceInstance
}

const supabaseService = new Proxy({}, {
  get(target, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

export default supabaseService