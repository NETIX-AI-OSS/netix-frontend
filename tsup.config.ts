import { defineConfig } from 'tsup'

// Peers stay external; tiny class utilities are bundled so cn() behaves identically everywhere.
const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'axios',
  'i18next',
  'react-i18next',
  'envoy-ts-auth',
  '@tanstack/react-query',
  'swr',
]
const noExternal = ['clsx', 'tailwind-merge', 'class-variance-authority']
const shared = { dts: true, treeshake: true, sourcemap: false, clean: false, external, noExternal }

export default defineConfig([
  {
    entry: {
      api: 'src/api/index.ts',
      auth: 'src/auth/index.ts',
      hooks: 'src/hooks/index.ts',
      utils: 'src/utils/index.ts',
      i18n: 'src/i18n/index.ts',
      tokens: 'src/tokens/index.ts',
    },
    format: ['esm', 'cjs'],
    ...shared,
  },
  {
    // The netix CLI: a self-contained node bin; prompt deps are bundled so the
    // package keeps zero runtime dependencies.
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    platform: 'node',
    target: 'node22',
    // `yaml` resolves to a CJS build under the `node` condition, and esbuild's
    // interop shim throws "Dynamic require ... is not supported" in an ESM bundle
    // unless a real `require` is in scope. Give it one — the bundle must stay a
    // single self-contained file with zero runtime dependencies.
    banner: {
      js: [
        '#!/usr/bin/env node',
        "import { createRequire as __netixCreateRequire } from 'node:module'",
        'const require = __netixCreateRequire(import.meta.url)',
      ].join('\n'),
    },
    dts: false,
    treeshake: true,
    sourcemap: false,
    clean: false,
    noExternal: ['@clack/prompts', 'picocolors', 'yaml'],
  },
  {
    entry: {
      'utils/dom': 'src/utils/dom/index.ts',
      theme: 'src/theme/index.ts',
    },
    format: ['esm'],
    splitting: true,
    ...shared,
  },
])
