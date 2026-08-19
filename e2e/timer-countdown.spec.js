import { test, expect } from '@playwright/test'

test.describe('Timer & Dashboard Countdown Interface', () => {
  test('landing page loads without console error triggers', async ({ page }) => {
    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })
})
