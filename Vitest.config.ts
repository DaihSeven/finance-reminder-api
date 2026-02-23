import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/services/**', 'src/repositories/**'],
      exclude: ['src/tests/**'],
    },

    include: ['src/tests/**/*.test.ts'],
  },
})