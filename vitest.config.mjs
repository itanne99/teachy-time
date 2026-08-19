import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['./tests/**/*.test.js', './tests/**/*.test.jsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/**', 'src/pages/api/**'],
    },
  },
})
