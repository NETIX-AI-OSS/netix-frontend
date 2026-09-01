// @vitest-environment node
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { applyScaffoldTransforms } from './scaffold'
import { loadManifest } from './services'
import type { ScaffoldOptions } from './transforms'

const FIXTURE = fileURLToPath(new URL('../../tests/fixtures/mini-template', import.meta.url))

const options = (over: Partial<ScaffoldOptions & { stripDemo: boolean }> = {}) => ({
  name: 'ops-console-ui',
  title: 'Ops Console',
  baseDomain: 'acme.dev',
  services: ['data', 'cafm'],
  manifest: loadManifest(),
  libRef: 'v2.0.0',
  registryUrl: 'https://example.com/r/{name}.json',
  stripDemo: false,
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
  expect(read('.env.example')).toBe(read('.env'))
  expect(read('app/client/http-cafm-service-client.ts')).toContain('httpCafmServiceClient')
  expect(read('app/client/local-dev-urls.ts')).toContain('LOCAL_DEV_CAFM_SERVICE_BASE_URL')
  expect(read('app/client/http-data-service-client.ts')).toContain('httpDataServiceClient')
  expect(read('orval.config.ts')).toContain("'cafm-service': {")
  expect(JSON.parse(read('components.json')).registries['@netix']).toBe(
    'https://example.com/r/{name}.json',
  )
  expect(existsSync(join(root, 'app/pages/profile.tsx'))).toBe(true)
  expect(notes).toContain('wired cafm-service client')
  expect(notes).toContain('wrote .env.example')
})

it('removes the data service entirely when unselected and retargets its test', () => {
  applyScaffoldTransforms(root, options({ services: ['user'] }))

  expect(existsSync(join(root, 'app/client/http-data-service-client.ts'))).toBe(false)
  expect(existsSync(join(root, 'app/client/http-data-service-client.test.ts'))).toBe(false)
  expect(existsSync(join(root, 'schema/data-service.yaml'))).toBe(false)
  expect(read('app/client/http-user-service-client.ts')).toContain("clientName: 'user-service'")
  expect(read('app/client/http-user-service-client.test.ts')).toContain('user-service')
  expect(read('orval.config.ts')).not.toContain('data-service')
  expect(read('.env')).not.toContain('VITE_DATA_SERVICE_BASE_URL')
})

it('strips the demo pages on request', () => {
  applyScaffoldTransforms(root, options({ stripDemo: true }))

  for (const page of ['profile', 'permissions', 'security', 'support'])
    expect(existsSync(join(root, `app/pages/${page}.tsx`))).toBe(false)
  expect(existsSync(join(root, 'app/pages/home.tsx'))).toBe(true)
  expect(read('app/pages/lazy.ts')).not.toContain('ProfilePage')
  expect(read('app/main.tsx')).not.toContain('"/profile"')
  expect(read('app/main.tsx')).toContain('</Routes>')
})

it('notes files the template no longer carries instead of failing', () => {
  rmSync(join(root, 'app/lib/organization-locale.ts'))
  const notes = applyScaffoldTransforms(root, options())
  expect(notes).toContain('skipped app/lib/organization-locale.ts (not in template)')
})

it('tolerates a template without the data client test or the renameable manifests', () => {
  rmSync(join(root, 'app/client/http-data-service-client.test.ts'))
  rmSync(join(root, 'app-ui-ingress.yaml'))
  applyScaffoldTransforms(root, options({ services: ['user'] }))

  expect(existsSync(join(root, 'app/client/http-user-service-client.ts'))).toBe(true)
  expect(existsSync(join(root, 'app/client/http-user-service-client.test.ts'))).toBe(false)
  expect(existsSync(join(root, 'ops-console-ui-ingress.yaml'))).toBe(false)
  expect(existsSync(join(root, 'ops-console-ui-deployment.yaml'))).toBe(true)
})
