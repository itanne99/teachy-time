import { execSync } from 'child_process'

export default async function globalTeardown() {
  if (process.env.TEST_STARTED_SUPABASE === 'true') {
    console.log('[Playwright Teardown] Stopping local Supabase started for tests...')
    try {
      execSync('npx supabase stop', { stdio: 'inherit' })
      console.log('[Playwright Teardown] Supabase stopped cleanly.')
    } catch (error) {
      console.warn('[Playwright Teardown] Warning: Error stopping Supabase:', error.message)
    }
  }
}
