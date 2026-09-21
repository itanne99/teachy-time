import { execSync } from 'child_process'

export default async function globalSetup() {
  console.log('[Playwright Setup] Checking local Supabase status...')
  let isRunning = false

  try {
    const res = await fetch('http://127.0.0.1:54321/auth/v1/health', { signal: AbortSignal.timeout(3000) })
    if (res.ok || res.status < 500) {
      isRunning = true
    }
  } catch {
    isRunning = false
  }

  if (isRunning) {
    console.log('[Playwright Setup] Supabase is already running.')
  } else {
    console.log('[Playwright Setup] Starting local Supabase...')
    try {
      execSync('npx supabase start --ignore-health-check', { stdio: 'inherit' })
      process.env.TEST_STARTED_SUPABASE = 'true'
      console.log('[Playwright Setup] Supabase started successfully.')
    } catch (error) {
      console.warn('[Playwright Setup] Warning: Could not start local Supabase automatically:', error.message)
    }
  }
}
