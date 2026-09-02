// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { loadManifest } from './services'

it('loads and validates the committed manifest', () => {
  const manifest = loadManifest()
  const keys = Object.keys(manifest.services)
  // The always-wired user service leads; the rest are the app-facing backends, alphabetical.
  expect(keys).toEqual([
    'user',
    'asset',
    'cafm',
    'data',
    'gateway',
    'ml-engine',
    'notification',
    'report',
    'simulator',
    'stormbreaker',
    'tag',
    'update',
    'vision-ai',
    'visualization',
  ])
  for (const service of Object.values(manifest.services)) {
    expect(service.backendRepo).toMatch(/^NETIX-AI\/[\w-]+$/)
    expect(service.specPath).toMatch(/^openapi\/[\w-]+\.yaml$/)
    expect(service.envVar).toMatch(/^VITE_[A-Z_]+_BASE_URL$/)
    expect(service.localPort).toBeGreaterThan(0)
    // Curated per service from its own OpenAPI spec — a collection, not a detail route.
    expect(service.listEndpoint).toMatch(/^\/[\w/-]+\/$/)
  }
})

describe('rejects invalid manifests', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'netix-manifest-'))
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  const write = (manifest: unknown) => {
    const file = join(dir, 'services.json')
    writeFileSync(file, JSON.stringify(manifest))
    return pathToFileURL(file)
  }

  it('missing field', () => {
    const url = write({
      services: {
        x: {
          specPath: 'openapi/x.yaml',
          envVar: 'VITE_X_BASE_URL',
          apiSubdomain: 'x.api',
          localPort: 1,
        },
      },
    })
    expect(() => loadManifest(url)).toThrow('x is missing backendRepo')
  })

  it('relative listEndpoint', () => {
    const url = write({
      services: {
        x: {
          backendRepo: 'a/b',
          specPath: 'openapi/x.yaml',
          envVar: 'VITE_X_BASE_URL',
          apiSubdomain: 'x.api',
          listEndpoint: 'api/x/',
          localPort: 1,
        },
      },
    })
    expect(() => loadManifest(url)).toThrow('x listEndpoint must start with "/"')
  })

  it('missing port', () => {
    const url = write({
      services: {
        x: {
          backendRepo: 'a/b',
          specPath: 'openapi/x.yaml',
          envVar: 'VITE_X_BASE_URL',
          apiSubdomain: 'x.api',
          listEndpoint: '/api/x/',
          localPort: 'many',
        },
      },
    })
    expect(() => loadManifest(url)).toThrow('x has no localPort')
  })
})
