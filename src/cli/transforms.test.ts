// @vitest-environment node
import { readFileSync } from 'node:fs'

import { loadManifest } from './services'
import {
  deployRenames,
  insertDevUpstream,
  insertEnvApiEntry,
  insertLazyPageEntry,
  insertNavEntry,
  insertOrvalBlock,
  insertRouteEntry,
  pageNames,
  rewriteComponentsJson,
  rewriteDeployFile,
  rewriteDevPort,
  rewriteDocs,
  rewriteEnv,
  rewriteEnvConfig,
  rewriteIndexHtml,
  rewriteLazyPages,
  rewriteNavigation,
  rewriteOrganizationLocale,
  rewriteOrvalConfig,
  rewritePackageJson,
  rewriteRoutes,
  rewriteViteProxy,
  type ScaffoldOptions,
  serviceNames,
} from './transforms'

const fixture = (path: string) =>
  readFileSync(new URL(`../../tests/fixtures/mini-template/${path}`, import.meta.url), 'utf8')

const options = (over: Partial<ScaffoldOptions> = {}): ScaffoldOptions => ({
  name: 'asset-console-ui',
  title: 'Asset Console',
  baseDomain: 'acme.dev',
  devPort: 5173,
  services: ['data', 'cafm'],
  manifest: loadManifest(),
  libRef: 'v2.0.0',
  registryUrl: 'https://example.com/r/{name}.json',
  ...over,
})

it('derives every naming form from a service key', () => {
  expect(serviceNames('cafm')).toEqual({
    key: 'cafm',
    slug: 'cafm-service',
    screaming: 'CAFM_SERVICE',
    pascal: 'CafmService',
    camel: 'cafmService',
  })
})

it('names a generated page the way a hand-written one is named', () => {
  expect(pageNames('ml-engine')).toEqual({
    file: 'app/pages/ml-engine.tsx',
    component: 'MlEnginePage',
    importPath: '@/pages/ml-engine',
    path: '/workspace/ml-engine',
  })
})

it('renames the package and pins netix-frontend to a git ref', () => {
  const pkg = JSON.parse(rewritePackageJson(fixture('package.json'), options()))
  expect(pkg.name).toBe('asset-console-ui')
  expect(pkg.dependencies['netix-frontend']).toBe('github:NETIX-AI-OSS/netix-frontend#v2.0.0')
  expect(pkg.description).toContain('Asset Console')
})

it('titles index.html', () => {
  expect(rewriteIndexHtml(fixture('index.html'), options())).toContain(
    '<title>Asset Console</title>',
  )
})

it('sets the locale application identifier', () => {
  expect(rewriteOrganizationLocale(fixture('app/lib/organization-locale.ts'), options())).toContain(
    "application: 'asset-console-ui'",
  )
})

it('rewrites the deploy identity and host in every manifest', () => {
  for (const path of ['docker-compose.yaml', 'app-ui-deployment.yaml', 'app-ui-ingress.yaml']) {
    const out = rewriteDeployFile(fixture(path), options())
    expect(out).not.toContain('app-ui')
    expect(out).not.toContain('app.netixai.dev')
  }
  expect(rewriteDeployFile(fixture('app-ui-ingress.yaml'), options())).toContain(
    'asset-console-ui.acme.dev',
  )
  expect(deployRenames(options())).toEqual({
    'app-ui-deployment.yaml': 'asset-console-ui-deployment.yaml',
    'app-ui-ingress.yaml': 'asset-console-ui-ingress.yaml',
  })
})

it('sets the domain and keeps .env free of service urls', () => {
  const env = rewriteEnv(fixture('.env'), options())
  expect(env).toContain('VITE_BASE_DOMAIN=acme.dev')
  expect(env).not.toContain('netixai.dev\n')
  expect(env).not.toContain('_SERVICE_BASE_URL')
})

it('refuses a template whose .env lost its domain input', () => {
  expect(() => rewriteEnv('VITE_SENTRY_DSN=x\n', options())).toThrow('VITE_BASE_DOMAIN')
})

describe('app/config/env.ts', () => {
  it('inserts one ENV.api entry per selected service', () => {
    const out = rewriteEnvConfig(fixture('app/config/env.ts'), options())
    expect(out).toContain("dataService: serviceUrl('data.api', '/data-api'),")
    expect(out).toContain("cafmService: serviceUrl('cafm.api', '/cafm-api'),")
  })

  it('leaves the empty api map alone when no service is selected', () => {
    const out = rewriteEnvConfig(fixture('app/config/env.ts'), options({ services: [] }))
    expect(out).toContain('api: {},')
    // Match an actual entry line: `serviceUrl` also appears as the helper and in the doc comment.
    expect(out).not.toMatch(/^ {6}\w+Service: serviceUrl\(/m)
  })

  it('rejects an unknown service and a file without an api map', () => {
    expect(() =>
      rewriteEnvConfig(fixture('app/config/env.ts'), options({ services: ['nope'] })),
    ).toThrow('unknown service: nope')
    expect(() => rewriteEnvConfig('export const ENV = {}', options())).toThrow('no `api` map found')
  })
})

describe('vite.config.ts dev proxy', () => {
  it('inserts one upstream entry per selected service, above /user-api', () => {
    const out = rewriteViteProxy(fixture('vite.config.ts'), options())
    expect(out).toContain("'/data-api': `https://data.api.${baseDomain}`,")
    expect(out).toContain("'/cafm-api': `https://cafm.api.${baseDomain}`,")
    expect(out.indexOf("'/data-api'")).toBeLessThan(out.indexOf("'/user-api'"))
  })

  it('never duplicates the always-present /user-api entry', () => {
    const out = rewriteViteProxy(fixture('vite.config.ts'), options({ services: ['user'] }))
    expect(out.match(/'\/user-api'/g)).toHaveLength(1)
    expect(out).not.toContain('/data-api')
  })

  it('rejects an unknown service and a template without the user upstream', () => {
    expect(() =>
      rewriteViteProxy(fixture('vite.config.ts'), options({ services: ['nope'] })),
    ).toThrow('unknown service: nope')
    expect(() => rewriteViteProxy('export default {}', options())).toThrow(
      'user-api upstream not found',
    )
  })
})

describe('orval.config.ts', () => {
  it('inserts one generation block per selected service', () => {
    const out = rewriteOrvalConfig(fixture('orval.config.ts'), options())
    expect(out).toContain("'data-service': {")
    expect(out).toContain("'cafm-service': {")
    expect(out).toContain('./schema/cafm-service.yaml')
    expect(out).toContain("name: 'httpCafmServiceClient'")
  })

  it('leaves an empty config when nothing is selected, and rejects an unrecognizable one', () => {
    expect(rewriteOrvalConfig(fixture('orval.config.ts'), options({ services: [] }))).toContain(
      'defineConfig({})',
    )
    expect(() => rewriteOrvalConfig('export default defineConfig({ x: 1 })', options())).toThrow(
      'defineConfig block not found',
    )
  })
})

it('registers the @netix registry in components.json', () => {
  const config = JSON.parse(rewriteComponentsJson(fixture('components.json'), options()))
  expect(config.registries['@netix']).toBe('https://example.com/r/{name}.json')
})

it('rebrands the docs', () => {
  expect(rewriteDocs('# cookie-cutter-ui\nBased on frontend-template.', options())).toBe(
    '# asset-console-ui\nBased on asset-console-ui.',
  )
})

describe('per-service inserts on an already-wired app (netix service add)', () => {
  const manifest = loadManifest()
  const svc = (key: string) => manifest.services[key]!

  it('appends into a populated ENV.api map, after the existing entries', () => {
    const one = rewriteEnvConfig(fixture('app/config/env.ts'), options({ services: ['data'] }))
    const two = insertEnvApiEntry(one, 'cafm', svc('cafm'))
    expect(two).toContain("dataService: serviceUrl('data.api', '/data-api'),")
    expect(two).toContain("cafmService: serviceUrl('cafm.api', '/cafm-api'),")
    expect(two.indexOf('dataService')).toBeLessThan(two.indexOf('cafmService'))
    expect(two).toContain('authBaseUrl')
  })

  it('appends a block to a populated orval config, keeping the closing intact', () => {
    const one = rewriteOrvalConfig(fixture('orval.config.ts'), options({ services: ['data'] }))
    const two = insertOrvalBlock(one, 'cafm')
    expect(two).toContain("'data-service': {")
    expect(two).toContain("'cafm-service': {")
    expect(two.indexOf('data-service')).toBeLessThan(two.indexOf('cafm-service'))
    expect(two.trimEnd().endsWith('})')).toBe(true)
  })

  it('is idempotent for every file: re-inserting a wired service changes nothing', () => {
    const env = rewriteEnvConfig(fixture('app/config/env.ts'), options({ services: ['data'] }))
    expect(insertEnvApiEntry(env, 'data', svc('data'))).toBe(env)
    const orval = rewriteOrvalConfig(fixture('orval.config.ts'), options({ services: ['data'] }))
    expect(insertOrvalBlock(orval, 'data')).toBe(orval)
    const vite = rewriteViteProxy(fixture('vite.config.ts'), options({ services: ['data'] }))
    expect(insertDevUpstream(vite, 'data', svc('data'))).toBe(vite)
    const lazy = rewriteLazyPages(fixture('app/pages/lazy.ts'), options({ services: ['data'] }))
    expect(insertLazyPageEntry(lazy, 'data')).toBe(lazy)
    const routes = rewriteRoutes(fixture('app/main.tsx'), options({ services: ['data'] }))
    expect(insertRouteEntry(routes, 'data')).toBe(routes)
    const nav = rewriteNavigation(fixture('app/lib/navigation.ts'), options({ services: ['data'] }))
    expect(insertNavEntry(nav, 'data', svc('data'))).toBe(nav)
  })

  it('respects an app hand-edit as "already wired" instead of duplicating', () => {
    const edited = rewriteEnvConfig(
      fixture('app/config/env.ts'),
      options({ services: ['data'] }),
    ).replace("'/data-api'", "'/custom-data'")
    expect(insertEnvApiEntry(edited, 'data', svc('data'))).toBe(edited)
  })
})

describe('page wiring', () => {
  it('adds a lazy export per service above the anchor', () => {
    const out = rewriteLazyPages(fixture('app/pages/lazy.ts'), options())
    expect(out).toContain("export const DataPage = lazy(() => import('@/pages/data'))")
    expect(out).toContain("export const CafmPage = lazy(() => import('@/pages/cafm'))")
    expect(out.indexOf('CafmPage')).toBeLessThan(out.indexOf('// netix-pages:insert'))
  })

  it('adds a route per service above the anchor, before the catch-all', () => {
    const out = rewriteRoutes(fixture('app/main.tsx'), options())
    expect(out).toContain('path="/workspace/cafm"')
    expect(out).toContain('<Pages.CafmPage />')
    expect(out.indexOf('<Pages.CafmPage />')).toBeLessThan(out.indexOf('path="*"'))
  })

  it('adds a navigation entry per service above the anchor', () => {
    const out = rewriteNavigation(fixture('app/lib/navigation.ts'), options())
    expect(out).toContain("label: 'CAFM',")
    expect(out).toContain("path: '/workspace/cafm',")
    expect(out).toContain('description: ')
    expect(out.indexOf("path: '/workspace/cafm',")).toBeLessThan(out.indexOf('// netix-nav:insert'))
  })

  it('is a no-op with no services and throws without the anchor', () => {
    for (const [rewrite, path, anchor] of [
      [rewriteLazyPages, 'app/pages/lazy.ts', 'netix-pages:insert'],
      [rewriteRoutes, 'app/main.tsx', 'netix-routes:insert'],
      [rewriteNavigation, 'app/lib/navigation.ts', 'netix-nav:insert'],
    ] as const) {
      const content = fixture(path)
      expect(rewrite(content, options({ services: [] }))).toBe(content)
      expect(() => rewrite('export const nothing = []', options())).toThrow(anchor)
    }
  })

  it('never gives the user service a page', () => {
    for (const [rewrite, path] of [
      [rewriteLazyPages, 'app/pages/lazy.ts'],
      [rewriteRoutes, 'app/main.tsx'],
      [rewriteNavigation, 'app/lib/navigation.ts'],
    ] as const) {
      const content = fixture(path)
      expect(rewrite(content, options({ services: ['user'] }))).toBe(content)
    }
  })
})

it('swaps the template dev port everywhere it appears', () => {
  const out = rewriteDevPort(fixture('vite.config.ts'), options({ devPort: 3000 }))

  expect(out).toContain('port: 3000,')
  expect(out).not.toContain('5174')
})

it('leaves the port alone when the app keeps the template default', () => {
  const content = fixture('docker-compose.yaml')

  expect(rewriteDevPort(content, options({ devPort: 5174 }))).toBe(content)
})
