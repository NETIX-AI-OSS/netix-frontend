// @vitest-environment node
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { applyScaffoldTransforms, applyServiceWiring } from './scaffold'
import { loadManifest } from './services'
import type { ScaffoldOptions } from './transforms'

const FIXTURE = fileURLToPath(new URL('../../tests/fixtures/mini-template', import.meta.url))

const options = (over: Partial<ScaffoldOptions> = {}) => ({
  name: 'ops-console-ui',
  title: 'Ops Console',
  baseDomain: 'acme.dev',
  devPort: 5173,
  services: ['data', 'cafm'],
  manifest: loadManifest(),
  libRef: 'v2.0.0',
  registryUrl: 'https://example.com/r/{name}.json',
  ...over,
})

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'netix-scaffold-'))
  cpSync(FIXTURE, root, { recursive: true })
})

afterEach(() => rmSync(root, { recursive: true, force: true }))

const read = (path: string) => readFileSync(join(root, path), 'utf8')

it('applies the full pipeline for data + cafm', () => {
  const notes = applyScaffoldTransforms(root, options())

  expect(JSON.parse(read('package.json')).name).toBe('ops-console-ui')
  expect(read('index.html')).toContain('<title>Ops Console</title>')
  expect(existsSync(join(root, 'ops-console-ui-deployment.yaml'))).toBe(true)
  expect(existsSync(join(root, 'app-ui-deployment.yaml'))).toBe(false)
  expect(read('.env')).toContain('VITE_BASE_DOMAIN=acme.dev')
  expect(read('.env')).not.toContain('_SERVICE_BASE_URL')
  expect(read('app/client/http-cafm-service-client.ts')).toContain('httpCafmServiceClient')
  expect(read('app/client/http-cafm-service-client.ts')).toContain('ENV.api.cafmService')
  expect(existsSync(join(root, 'app/client/http-cafm-service-client.test.ts'))).toBe(true)
  expect(read('app/client/http-data-service-client.ts')).toContain('ENV.api.dataService')
  expect(read('app/config/env.ts')).toContain("cafmService: serviceUrl('cafm.api', '/cafm-api')")
  expect(read('vite.config.ts')).toContain("'/cafm-api': `https://cafm.api.${baseDomain}`")
  expect(read('vite.config.ts')).toContain('port: 5173,')
  expect(read('docker-compose.yaml')).toContain('- 5173:5173')
  expect(read('orval.config.ts')).toContain("'cafm-service': {")
  expect(JSON.parse(read('components.json')).registries['@netix']).toBe(
    'https://example.com/r/{name}.json',
  )
  expect(notes).toContain('wired cafm-service client')
  expect(notes).toContain('added cafm page (no spec yet — columns inferred from the first row)')
  expect(read('app/pages/cafm.tsx')).toContain('export default function CafmPage()')
  expect(read('app/pages/lazy.ts')).toContain(
    "export const DataPage = lazy(() => import('@/pages/data'))",
  )
  expect(read('app/main.tsx')).toContain('<Pages.DataPage />')
  expect(read('app/lib/navigation.ts')).toContain("path: '/workspace/data',")
  expect(notes).toContain('wrote .env')
})

it('builds the generated page columns from a spec already on disk', () => {
  // `init` pulls schemas before it transforms, so this is the normal path: the page
  // gets its header row from the contract and keeps it when the collection is empty.
  mkdirSync(join(root, 'schema'), { recursive: true })
  writeFileSync(
    join(root, 'schema/cafm-service.yaml'),
    `openapi: 3.1.0
paths:
  /api/service-request/:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedServiceRequestList'
components:
  schemas:
    PaginatedServiceRequestList:
      type: object
      properties:
        results:
          type: array
          items:
            $ref: '#/components/schemas/ServiceRequest'
    ServiceRequest:
      type: object
      properties:
        id: { type: integer }
        description: { type: [string, 'null'] }
        created_on: { type: string, format: date-time }
        asset_details: { type: object }
`,
  )

  const notes = applyScaffoldTransforms(root, options({ services: ['cafm'] }))

  expect(notes).toContain('added cafm page (3 columns from schema/cafm-service.yaml)')
  const page = read('app/pages/cafm.tsx')
  expect(page).toContain("{ field: 'description', kind: 'text' },")
  expect(page).toContain("{ field: 'id', kind: 'number' },")
  expect(page).toContain("key: field === 'id' ? 'id__in' : field + '__in'")
  expect(page).toContain("{ field: 'created_on', kind: 'date' },")
  // asset_details has no sensible cell, so it never becomes a column.
  expect(page).not.toContain('asset_details')
  expect(page).not.toContain('inferColumns')
})

it('writes only the selected service and never a data-service leftover', () => {
  applyScaffoldTransforms(root, options({ services: ['user'] }))

  expect(existsSync(join(root, 'app/client/http-data-service-client.ts'))).toBe(false)
  expect(read('app/client/http-user-service-client.ts')).toContain("clientName: 'user-service'")
  expect(read('app/client/http-user-service-client.test.ts')).toContain('user-service')
  expect(read('orval.config.ts')).not.toContain('data-service')
  expect(read('app/config/env.ts')).not.toContain('dataService')
  expect(read('app/config/env.ts')).toContain("userService: serviceUrl('user.api', '/user-api')")
  expect(read('vite.config.ts')).not.toContain('/data-api')
  expect(read('vite.config.ts').match(/'\/user-api'/g)).toHaveLength(1)

  // The user service is a client, never a page: the access pages are its UI.
  expect(existsSync(join(root, 'app/pages/user.tsx'))).toBe(false)
  expect(read('app/pages/lazy.ts')).not.toContain('UserPage')
  expect(read('app/lib/navigation.ts')).not.toContain("path: '/workspace/user',")
})

it('leaves a service-free app with no clients and an empty api map', () => {
  applyScaffoldTransforms(root, options({ services: [] }))

  expect(read('app/config/env.ts')).toContain('api: {},')
  expect(read('orval.config.ts')).toContain('defineConfig({})')
  expect(read('vite.config.ts').match(/'\/[a-z-]+-api':/g)).toEqual(["'/user-api':"])
})

it('notes files the template no longer carries instead of failing', () => {
  rmSync(join(root, 'app/lib/organization-locale.ts'))
  const notes = applyScaffoldTransforms(root, options())
  expect(notes).toContain('skipped app/lib/organization-locale.ts (not in template)')
})

it('tolerates a template missing the renameable manifests', () => {
  rmSync(join(root, 'app-ui-ingress.yaml'))
  applyScaffoldTransforms(root, options({ services: ['user'] }))

  expect(existsSync(join(root, 'app/client/http-user-service-client.ts'))).toBe(true)
  expect(existsSync(join(root, 'app/client/http-user-service-client.test.ts'))).toBe(true)
  expect(existsSync(join(root, 'ops-console-ui-ingress.yaml'))).toBe(false)
  expect(existsSync(join(root, 'ops-console-ui-deployment.yaml'))).toBe(true)
})

describe('applyServiceWiring (netix service add)', () => {
  it('wires a second service into an app scaffolded with one', () => {
    applyScaffoldTransforms(root, options({ services: ['data'] }))
    const notes = applyServiceWiring(root, ['cafm'], loadManifest())

    expect(read('app/client/http-cafm-service-client.ts')).toContain('httpCafmServiceClient')
    expect(existsSync(join(root, 'app/client/http-cafm-service-client.test.ts'))).toBe(true)
    expect(read('orval.config.ts')).toContain("'data-service': {")
    expect(read('orval.config.ts')).toContain("'cafm-service': {")
    expect(read('app/config/env.ts')).toContain("cafmService: serviceUrl('cafm.api', '/cafm-api')")
    expect(read('vite.config.ts')).toContain("'/cafm-api': `https://cafm.api.${baseDomain}`")
    expect(read('app/pages/cafm.tsx')).toContain('export default function CafmPage()')
    expect(read('app/pages/lazy.ts')).toContain("import('@/pages/cafm')")
    expect(read('app/main.tsx')).toContain('<Pages.CafmPage />')
    expect(read('app/lib/navigation.ts')).toContain("label: 'CAFM',")
    expect(notes).toContain('wired cafm-service client')
    expect(notes).toContain('added cafm page (no spec yet — columns inferred from the first row)')
  })

  it('keeps every app-owned file and entry on a re-run', () => {
    applyScaffoldTransforms(root, options({ services: ['data'] }))
    const customized = `// customized by the app\n${read('app/client/http-data-service-client.ts')}`
    writeFileSync(join(root, 'app/client/http-data-service-client.ts'), customized)

    const notes = applyServiceWiring(root, ['data'], loadManifest())

    expect(read('app/client/http-data-service-client.ts')).toBe(customized)
    expect(notes).toContain('kept app/client/http-data-service-client.ts (already exists)')
    expect(read('orval.config.ts').match(/'data-service':/g)).toHaveLength(1)
    expect(read('app/config/env.ts').match(/dataService: serviceUrl/g)).toHaveLength(1)
    expect(read('vite.config.ts').match(/'\/data-api':/g)).toHaveLength(1)
    expect(read('app/pages/lazy.ts').match(/DataPage/g)).toHaveLength(1)
    expect(read('app/main.tsx').match(/<Pages\.DataPage \/>/g)).toHaveLength(1)
    expect(read('app/lib/navigation.ts').match(/'\/workspace\/data'/g)).toHaveLength(1)
  })

  it('wires the user service as a client only, never as a page', () => {
    applyServiceWiring(root, ['user'], loadManifest())

    expect(existsSync(join(root, 'app/client/http-user-service-client.ts'))).toBe(true)
    expect(read('orval.config.ts')).toContain("'user-service': {")
    expect(existsSync(join(root, 'app/pages/user.tsx'))).toBe(false)
    expect(read('app/pages/lazy.ts')).not.toContain('UserPage')
    expect(read('app/lib/navigation.ts')).not.toContain("path: '/workspace/user',")
  })

  it('throws for an unknown service and for a missing anchor file', () => {
    expect(() => applyServiceWiring(root, ['nope'], loadManifest())).toThrow(
      'unknown service: nope',
    )
    rmSync(join(root, 'orval.config.ts'))
    expect(() => applyServiceWiring(root, ['data'], loadManifest())).toThrow(
      'orval.config.ts not found',
    )
  })
})

it('keeps the chosen dev port out of the template default', () => {
  applyScaffoldTransforms(root, options({ devPort: 4000 }))

  expect(read('vite.config.ts')).toContain('port: 4000,')
  expect(read('vite.config.ts')).not.toContain('5174')
  expect(read('docker-compose.yaml')).toContain('- 4000:4000')
})
