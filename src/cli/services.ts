import { readFileSync } from 'node:fs'

import type { ServiceConfig, ServicesManifest } from './transforms'

/**
 * services.json sits at the package root both in the repo (src/cli/ → ../../) and in the
 * shipped package (dist/cli/ → ../../), so one relative URL serves both.
 */
export function loadManifest(
  url: URL = new URL('../../services.json', import.meta.url),
): ServicesManifest {
  const manifest = JSON.parse(readFileSync(url, 'utf8')) as ServicesManifest
  for (const [key, service] of Object.entries(manifest.services)) validateService(key, service)
  return manifest
}

function validateService(key: string, service: ServiceConfig) {
  for (const field of [
    'backendRepo',
    'specPath',
    'envVar',
    'apiSubdomain',
    'listEndpoint',
  ] as const)
    if (!service[field]) throw new Error(`services.json: ${key} is missing ${field}`)
  if (!Number.isInteger(service.localPort))
    throw new Error(`services.json: ${key} has no localPort`)
  // A module page fetches this verbatim against the service base URL: a route
  // that is not absolute would resolve against the app's own origin instead.
  if (!service.listEndpoint.startsWith('/'))
    throw new Error(`services.json: ${key} listEndpoint must start with "/"`)
}
