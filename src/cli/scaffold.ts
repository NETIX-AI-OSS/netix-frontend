import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { readSchemaColumns, specPathFor } from './openapi'
import { buildServiceClient, buildServiceClientTest, buildServicePage } from './service-files'
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
  type ServicesManifest,
} from './transforms'

const DEPLOY_FILES = [
  'docker-compose.yaml',
  'app-ui-deployment.yaml',
  'app-ui-ingress.yaml',
  '.github/workflows/docker-image-push.yaml',
]

/** Files carrying the dev-server port (vite.config.ts is handled with its proxy edit). */
const DEV_PORT_FILES = ['docker-compose.yaml', 'Dockerfile']

// The agent guide is one real file at docs/AGENTS.md; the root AGENTS.md/CLAUDE.md are
// symlinks to it, so rewriting the target covers all three paths.
const DOC_FILES = ['README.md', 'docs/AGENTS.md']

/**
 * Applies every scaffold transform to a template copy at `root`, in place.
 * Pure over the filesystem: no prompts, no network, no child processes.
 * Returns human-readable notes about what happened.
 */
export function applyScaffoldTransforms(root: string, options: ScaffoldOptions): string[] {
  const notes: string[] = []
  const edit = (path: string, transform: (content: string) => string) => {
    const file = join(root, path)
    if (!existsSync(file)) {
      notes.push(`skipped ${path} (not in template)`)
      return false
    }
    writeFileSync(file, transform(readFileSync(file, 'utf8')))
    return true
  }

  edit('package.json', (c) => rewritePackageJson(c, options))
  edit('index.html', (c) => rewriteIndexHtml(c, options))
  edit('app/lib/organization-locale.ts', (c) => rewriteOrganizationLocale(c, options))

  for (const path of DEPLOY_FILES) edit(path, (c) => rewriteDeployFile(c, options))
  for (const [from, to] of Object.entries(deployRenames(options)))
    if (existsSync(join(root, from))) renameSync(join(root, from), join(root, to))

  // .env is committed, in the template and in every app scaffolded from it: CI builds with a
  // bare `docker compose build`, which resolves the deploy inputs from this file.
  if (edit('.env', (c) => rewriteEnv(c, options))) notes.push('wrote .env')

  edit('orval.config.ts', (c) => rewriteOrvalConfig(c, options))
  edit('app/config/env.ts', (c) => rewriteEnvConfig(c, options))
  edit('vite.config.ts', (c) => rewriteDevPort(rewriteViteProxy(c, options), options))
  for (const path of DEV_PORT_FILES) edit(path, (c) => rewriteDevPort(c, options))

  for (const key of options.services) {
    const { slug } = serviceNames(key)
    writeFileSync(join(root, `app/client/http-${slug}-client.ts`), buildServiceClient(key))
    writeFileSync(join(root, `app/client/http-${slug}-client.test.ts`), buildServiceClientTest(key))
    notes.push(`wired ${slug} client`)

    // An ordinary page, generated: delete the file + its three wiring lines to remove it.
    // The user service gets none — the template's access pages are its UI.
    const service = options.manifest.services[key]
    if (service && key !== 'user') {
      // `init` pulls schemas before this runs, so the page's columns come from the
      // service's contract. An empty list means no spec on disk (--no-schemas).
      const columns = readSchemaColumns(specPathFor(root, slug), service.listEndpoint)
      writeFileSync(join(root, pageNames(key).file), buildServicePage(key, service, columns))
      notes.push(
        columns.length
          ? `added ${key} page (${columns.length} columns from schema/${slug}.yaml)`
          : `added ${key} page (no spec yet — columns inferred from the first row)`,
      )
    }
  }
  edit('app/pages/lazy.ts', (c) => rewriteLazyPages(c, options))
  edit('app/main.tsx', (c) => rewriteRoutes(c, options))
  edit('app/lib/navigation.ts', (c) => rewriteNavigation(c, options))

  edit('components.json', (c) => rewriteComponentsJson(c, options))
  for (const path of DOC_FILES) edit(path, (c) => rewriteDocs(c, options))

  return notes
}

/**
 * Wires services into an app that already exists — the `netix service add`
 * write path, sharing the per-service inserts with the scaffold above.
 * Idempotent and additive: files the app already owns are kept (never
 * overwritten), entries already present are left alone, so running it again —
 * or on a service `init` wired — only fills in whatever is missing.
 * Throws when a required file or its insert anchor is gone.
 */
export function applyServiceWiring(
  root: string,
  services: string[],
  manifest: ServicesManifest,
): string[] {
  const notes: string[] = []
  const writeIfMissing = (path: string, content: string, note: string) => {
    const file = join(root, path)
    if (existsSync(file)) {
      notes.push(`kept ${path} (already exists)`)
      return
    }
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
    notes.push(note)
  }
  const edit = (path: string, transform: (content: string) => string) => {
    const file = join(root, path)
    if (!existsSync(file)) throw new Error(`${path} not found — run this from the app root`)
    const content = readFileSync(file, 'utf8')
    const next = transform(content)
    if (next !== content) writeFileSync(file, next)
  }

  for (const key of services) {
    const service = manifest.services[key]
    if (!service) throw new Error(`unknown service: ${key}`)
    const { slug } = serviceNames(key)
    writeIfMissing(
      `app/client/http-${slug}-client.ts`,
      buildServiceClient(key),
      `wired ${slug} client`,
    )
    writeIfMissing(
      `app/client/http-${slug}-client.test.ts`,
      buildServiceClientTest(key),
      `wrote ${slug} client test`,
    )
    // The user service has no page — the template's access pages are its UI.
    if (key !== 'user') {
      const columns = readSchemaColumns(specPathFor(root, slug), service.listEndpoint)
      writeIfMissing(
        pageNames(key).file,
        buildServicePage(key, service, columns),
        columns.length
          ? `added ${key} page (${columns.length} columns from schema/${slug}.yaml)`
          : `added ${key} page (no spec yet — columns inferred from the first row)`,
      )
    }
    edit('orval.config.ts', (c) => insertOrvalBlock(c, key))
    edit('app/config/env.ts', (c) => insertEnvApiEntry(c, key, service))
    edit('vite.config.ts', (c) => insertDevUpstream(c, key, service))
    edit('app/pages/lazy.ts', (c) => insertLazyPageEntry(c, key))
    edit('app/main.tsx', (c) => insertRouteEntry(c, key))
    edit('app/lib/navigation.ts', (c) => insertNavEntry(c, key, service))
  }
  return notes
}
