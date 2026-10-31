import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // Normal mode unless a test turns the demo on (vi.stubEnv)
    env: { VITE_DEMO_MODE: 'false', VITE_API_URL: 'http://localhost:3000' },
  },
})
