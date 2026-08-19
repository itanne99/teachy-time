/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to homepage
    await page.goto('/')
    await use(page)
  },
})

export { expect } from '@playwright/test'
