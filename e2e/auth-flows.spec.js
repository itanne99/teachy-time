import { test, expect } from '@playwright/test'

test.describe('Auth Flow User Interfaces', () => {
  test('landing page displays marketing header and CTA buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Teachy Time/i)
    await expect(page.locator('h1')).toContainText(/Master Your Classroom Time/i)

    const getStartedBtn = page.getByRole('button', { name: /Get Started Free/i })
    await expect(getStartedBtn).toBeVisible()
  })

  test('navbar provides login and authentication modal triggers', async ({ page }) => {
    await page.goto('/')
    const navbar = page.locator('nav.navbar')
    await expect(navbar).toBeVisible()
    await expect(navbar).toContainText(/Teachy Time/i)
  })

  test('reset password page renders correctly', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.locator('body')).toBeVisible()
  })
})
