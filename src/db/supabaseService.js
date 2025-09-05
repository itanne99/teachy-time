
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://mgsqrwnwppjmijenbfys.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseService = createClient(supabaseUrl, supabaseKey)

export default supabaseService;