import { readdirSync } from 'node:fs'

import { defineConfig } from 'tsup'

// Per-component entries so an app importing one component never resolves another's peers.
const uiEntries = () => {
  const entries: Record<string, string> = {}
  for (const dir of ['primitives', 'composites'])
    for (const file of readdirSync(`src/ui/${dir}`)) {
      if (!file.endsWith('.tsx') || file.includes('.test.')) continue
      const name = file.replace(/\.tsx$/, '')
      if (entries[`ui/${name}`]) throw new Error(`ui module name collision: ${name}`)
      entries[`ui/${name}`] = `src/ui/${dir}/${file}`
    }
  return entries
}

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
  '@tanstack/react-table',
  '@tanstack/react-table/legacy',
  'swr',
  'react-router',
  'react-hook-form',
  'sonner',
  'lucide-react',
  'recharts',
  'react-day-picker',
  /^@radix-ui\//,
]
const noExternal = ['clsx', 'tailwind-merge', 'class-variance-authority']
const shared = { dts: true, treeshake: true, sourcemap: false, clean: false, external, noExternal }

export default defineConfig([
  {
    entry: {
      api: 'src/api/index.ts',
      hooks: 'src/hooks/index.ts',
      utils: 'src/utils/index.ts',
      i18n: 'src/i18n/index.ts',
      tokens: 'src/tokens/index.ts',
    },
    format: ['esm', 'cjs'],
    ...shared,
  },
  {
    entry: {
      'utils/dom': 'src/utils/dom/index.ts',
      'hooks/router': 'src/hooks/router.ts',
      ui: 'src/ui/index.ts',
      ...uiEntries(),
    },
    format: ['esm'],
    splitting: true,
    ...shared,
  },
])
