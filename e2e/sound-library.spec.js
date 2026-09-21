import { test, expect } from '@playwright/test'

test.describe('Sound Library and Audio Preferences', () => {
  test('profile page route responds and renders', async ({ page }) => {
    await page.goto('/Profile')
    await expect(page.locator('body')).toBeVisible()
  })
})
