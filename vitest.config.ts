import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  resolve: {
    // Registry composites are authored against app-style aliases; tests resolve them
    // to the primitive registry sources and the test-only utility fixture.
    alias: [
      {
        find: /^@\/components\/ui\/(.*)$/,
        replacement: here('registry/netix/ui/$1'),
      },
      { find: '@/lib/utils', replacement: here('registry/_fixtures/lib/utils') },
      // The mini-template's client test runs here as a template↔lib cross-check.
      { find: '@/config/env', replacement: here('tests/fixtures/mini-template/app/config/env.ts') },
      { find: 'netix-frontend/api', replacement: here('src/api/index.ts') },
      { find: 'netix-frontend/auth', replacement: here('src/auth/index.ts') },
      { find: 'netix-frontend/hooks', replacement: here('src/hooks/index.ts') },
      { find: 'netix-frontend/i18n', replacement: here('src/i18n/index.ts') },
      { find: 'netix-frontend/theme', replacement: here('src/theme/index.ts') },
      { find: 'netix-frontend/tokens', replacement: here('src/tokens/index.ts') },
      { find: 'netix-frontend/utils', replacement: here('src/utils/index.ts') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**', 'registry/netix/components/**'],
      exclude: ['src/tokens/tokens.ts'],
      // vitest 4 always folds glob-matched files back into the global gate, so both gates are globs.
      thresholds: {
        'src/!(theme|cli)/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/@(theme|cli)/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
        'registry/netix/components/**': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  },
})
