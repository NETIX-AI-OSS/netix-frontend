// @vitest-environment node
import { readFileSync } from 'node:fs'

import { loadManifest } from './services'
import {
  buildLocalDevUrls,
  buildServiceClient,
  deployRenames,
  rewriteComponentsJson,
  rewriteDeployFile,
  rewriteDocs,
  rewriteEnv,
  rewriteIndexHtml,
  rewriteOrganizationLocale,
  rewriteOrvalConfig,
  rewritePackageJson,
  rewriteViteEnv,
  type ScaffoldOptions,
  serviceNames,
  stripLazyBarrel,
  stripRouteImports,
  stripRoutes,
} from './transforms'

const fixture = (path: string) =>
  readFileSync(new URL(`../../tests/fixtures/mini-template/${path}`, import.meta.url), 'utf8')

const options = (over: Partial<ScaffoldOptions> = {}): ScaffoldOptions => ({
  name: 'asset-console-ui',
  title: 'Asset Console',
  baseDomain: 'acme.dev',
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

describe('.env', () => {
  it('sets the domain and appends the selected service urls', () => {
    const env = rewriteEnv(fixture('.env'), options())
    expect(env).toContain('BASE_DOMAIN=acme.dev')
    expect(env).toContain('VITE_DATA_SERVICE_BASE_URL=https://data.api.${BASE_DOMAIN}')
    expect(env).toContain('VITE_CAFM_SERVICE_BASE_URL=https://cafm.api.${BASE_DOMAIN}')
  })

  it('drops the data service when it is not selected', () => {
    const env = rewriteEnv(fixture('.env'), options({ services: ['user'] }))
    expect(env).not.toContain('VITE_DATA_SERVICE_BASE_URL')
    expect(env).toContain('VITE_USER_SERVICE_BASE_URL=https://user.api.${BASE_DOMAIN}')
  })

  it('rejects an unknown service', () => {
    expect(() => rewriteEnv(fixture('.env'), options({ services: ['nope'] }))).toThrow(
      'unknown service: nope',
    )
  })
})

it('rebuilds the env typings per selected service', () => {
  const out = rewriteViteEnv(fixture('app/vite-env.d.ts'), options({ services: ['cafm'] }))
  expect(out).toContain('readonly VITE_DEV_MODE: string')
  expect(out).toContain('readonly VITE_CAFM_SERVICE_BASE_URL: string')
  expect(out).not.toContain('VITE_DATA_SERVICE_BASE_URL')
})

it('writes one local-dev url per service with the manifest port', () => {
  const out = buildLocalDevUrls(options())
  expect(out).toContain("LOCAL_DEV_DATA_SERVICE_BASE_URL = 'http://localhost:8009/'")
  expect(out).toContain("LOCAL_DEV_CAFM_SERVICE_BASE_URL = 'http://localhost:8000/'")
  expect(() => buildLocalDevUrls(options({ services: ['nope'] }))).toThrow('unknown service')
})

it('clones the data client for another service', () => {
  const out = buildServiceClient(fixture('app/client/http-data-service-client.ts'), 'cafm')
  expect(out).toContain("clientName: 'cafm-service'")
  expect(out).toContain('CAFM_SERVICE_BASE_URL')
  expect(out).toContain('httpCafmServiceClient')
  expect(out).not.toContain('data-service')
})

describe('orval.config.ts', () => {
  it('emits one block per selected service', () => {
    const out = rewriteOrvalConfig(fixture('orval.config.ts'), options())
    expect(out).toContain("'data-service': {")
    expect(out).toContain("'cafm-service': {")
    expect(out).toContain('./schema/cafm-service.yaml')
    expect(out).toContain("name: 'httpCafmServiceClient'")
  })

  it('drops data when unselected and rejects a template without the block', () => {
    const out = rewriteOrvalConfig(fixture('orval.config.ts'), options({ services: ['user'] }))
    expect(out).not.toContain("'data-service'")
    expect(() => rewriteOrvalConfig('export default {}', options())).toThrow('block not found')
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

describe('demo strip', () => {
  it('filters the lazy barrel', () => {
    const out = stripLazyBarrel(fixture('app/pages/lazy.ts'))
    expect(out).toContain('HomePage')
    expect(out).toContain('DesignSystemPage')
    expect(out).toContain('SettingsPage')
    for (const gone of ['ProfilePage', 'PermissionsPage', 'SecurityPage', 'SupportPage'])
      expect(out).not.toContain(gone)
  })

  it('removes the demo route blocks but keeps the rest of the tree', () => {
    const out = stripRoutes(fixture('app/main.tsx'))
    expect(out).not.toContain('"/profile"')
    expect(out).not.toContain('"/security"')
    expect(out).toContain('path="/"')
    expect(out).toContain('/foundations/design-system')
    expect(out).toContain('</Routes>')
    expect(out).not.toContain('<ProfilePage />')
  })

  it('drops a single-line demo route too', () => {
    const single = '<Routes>\n  <Route path="/support" element={<X />} />\n</Routes>'
    expect(stripRoutes(single)).toBe('<Routes>\n</Routes>')
  })

  it('cleans the orphaned imports', () => {
    const out = stripRouteImports(stripRoutes(fixture('app/main.tsx')))
    for (const gone of ['ProfilePage', 'PermissionsPage', 'SecurityPage', 'SupportPage'])
      expect(out).not.toContain(gone)
    expect(out).toContain('HomePage')
  })
})
