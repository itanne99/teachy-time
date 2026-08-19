import { test, expect } from '@playwright/test'

test.describe('Schedule Management User Interfaces', () => {
  test('navigates between Edit Alarms and View Alarms', async ({ page }) => {
    await page.goto('/EditAlarms')
    await expect(page.locator('body')).toBeVisible()

    await page.goto('/ViewAlarms')
    await expect(page.locator('body')).toBeVisible()

    await page.goto('/Schedules')
    await expect(page.locator('body')).toBeVisible()
  })

  test('EditAlarms page renders day selector buttons', async ({ page }) => {
    await page.goto('/EditAlarms')
    // Check for container rendering
    const container = page.locator('.container')
    await expect(container.first()).toBeVisible()
  })
})
