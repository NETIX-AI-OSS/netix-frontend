import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/tokens/tokens.ts'],
      // vitest 4 always folds glob-matched files back into the global gate, so both gates are globs.
      thresholds: {
        'src/!(ui)/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/ui/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
      },
    },
  },
})
