/**
 * Pure text transforms `netix init` applies to a fresh copy of frontend-template.
 * Every function is (content, options) → content so the whole scaffold pipeline is
 * unit-testable against verbatim template fixtures — no fs, no network, no prompts.
 */

import { LIB_REPO } from './refs'
import {
  buildDevUpstreamEntry,
  buildEnvApiEntry,
  buildLazyPageEntry,
  buildNavEntry,
  buildOrvalBlock,
  buildRouteEntry,
} from './service-files'

export type ServiceConfig = {
  title: string
  backendRepo: string
  specPath: string
  localPort: number
  envVar: string
  apiSubdomain: string
  /** The collection a generated service page lists, e.g. "/api/service-request/". */
  listEndpoint: string
}

export type ServicesManifest = { services: Record<string, ServiceConfig> }

export type ScaffoldOptions = {
  /** kebab-case app name, e.g. "asset-console-ui" — also the deploy identity. */
  name: string
  /** Human title for index.html and docs. */
  title: string
  baseDomain: string
  /** Port `pnpm dev` (and the dev container) listens on. */
  devPort: number
  /** Selected service keys from the manifest, e.g. ["data", "cafm"]. */
  services: string[]
  manifest: ServicesManifest
  /** Git ref for the netix-frontend dependency, e.g. "v2.0.0". */
  libRef: string
  /** URL template for the @netix registry, with a literal `{name}` placeholder. */
  registryUrl: string
}

const pascalCase = (value: string) =>
  value
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join('')

/** Naming forms derived from a service key: "cafm" → cafm-service / CAFM_SERVICE / CafmService / cafmService. */
export function serviceNames(key: string) {
  const slug = `${key}-service`
  const screaming = slug.toUpperCase().replaceAll('-', '_')
  const pascal = pascalCase(slug)
  const camel = pascal[0]?.toLowerCase() + pascal.slice(1)
  return { key, slug, screaming, pascal, camel }
}

/**
 * Where a generated page lives and how it is named — the same shape a hand-written page
 * has: "ml-engine" → app/pages/ml-engine.tsx, MlEnginePage, /workspace/ml-engine.
 */
export function pageNames(key: string) {
  return {
    file: `app/pages/${key}.tsx`,
    component: `${pascalCase(key)}Page`,
    importPath: `@/pages/${key}`,
    path: `/workspace/${key}`,
  }
}

const TEMPLATE_NAME = 'cookie-cutter-ui'

/** The dev-server port frontend-template ships with; every scaffolded app swaps it for its own. */
export const TEMPLATE_DEV_PORT = 5174

export function rewritePackageJson(content: string, options: ScaffoldOptions): string {
  const pkg = JSON.parse(content) as Record<string, unknown>
  pkg.name = options.name
  pkg.description = `${options.title} — a NETIX frontend`
  for (const field of ['dependencies', 'devDependencies'] as const) {
    const deps = pkg[field] as Record<string, string> | undefined
    if (deps?.['netix-frontend']) deps['netix-frontend'] = `github:${LIB_REPO}#${options.libRef}`
  }
  return `${JSON.stringify(pkg, null, 2)}\n`
}

export function rewriteIndexHtml(content: string, options: ScaffoldOptions): string {
  return content.replace(/<title>.*<\/title>/, `<title>${options.title}</title>`)
}

export function rewriteOrganizationLocale(content: string, options: ScaffoldOptions): string {
  return content.replace(/application: '[^']*'/, `application: '${options.name}'`)
}

/** Deploy manifests: the template's `app-ui` identity and `app.netixai.dev` host. */
export function rewriteDeployFile(content: string, options: ScaffoldOptions): string {
  return content
    .replaceAll('app.netixai.dev', `${options.name}.${options.baseDomain}`)
    .replaceAll('app-ui', options.name)
}

/**
 * Dev-server port: vite.config.ts's `server.port`, the port docker-compose maps and the
 * Dockerfile exposes. One number in three files, so a literal swap keeps them in step.
 */
export function rewriteDevPort(content: string, options: ScaffoldOptions): string {
  return content.replaceAll(String(TEMPLATE_DEV_PORT), String(options.devPort))
}

/** Files whose on-disk names carry the deploy identity. */
export function deployRenames(options: ScaffoldOptions): Record<string, string> {
  return {
    'app-ui-deployment.yaml': `${options.name}-deployment.yaml`,
    'app-ui-ingress.yaml': `${options.name}-ingress.yaml`,
  }
}

/**
 * `.env` is committed (template and app alike — CI resolves the deploy inputs from it), and
 * carries exactly one of them: the base domain every service URL derives from in
 * app/config/env.ts. The scaffold sets it to the app's domain.
 */
export function rewriteEnv(content: string, options: ScaffoldOptions): string {
  const line = `VITE_BASE_DOMAIN=${options.baseDomain}`
  if (!/^VITE_BASE_DOMAIN=.*$/m.test(content)) throw new Error('.env: VITE_BASE_DOMAIN not found')
  return content.replace(/^VITE_BASE_DOMAIN=.*$/m, line)
}

function requireService(options: ScaffoldOptions, key: string) {
  const service = options.manifest.services[key]
  if (!service) throw new Error(`unknown service: ${key}`)
  return service
}

/*
 * The insert functions below wire one service into one file, and are the
 * shared write path of `netix init` (fresh template, empty anchors) and
 * `netix service add` (living app, populated anchors). Each is idempotent: a
 * service that is already present leaves the content untouched, so re-adding
 * never duplicates an entry and never clobbers an app's hand edits.
 */

const EMPTY_API = '    api: {},'
const API_BLOCK = /( {4}api: \{\n(?: {6}.*\n)*)( {4}\},)/

/** app/config/env.ts: insert one `ENV.api` entry; no-op when the service already has one. */
export function insertEnvApiEntry(content: string, key: string, service: ServiceConfig): string {
  const { camel } = serviceNames(key)
  if (new RegExp(`^\\s*${camel}: serviceUrl\\(`, 'm').test(content)) return content
  const entry = buildEnvApiEntry(key, service)
  if (content.includes(EMPTY_API)) return content.replace(EMPTY_API, `    api: {\n${entry}    },`)
  if (API_BLOCK.test(content))
    return content.replace(API_BLOCK, (_, open: string, close: string) => `${open}${entry}${close}`)
  throw new Error('app/config/env.ts: no `api` map found to insert into')
}

const USER_UPSTREAM = "    '/user-api': `https://user.api.${baseDomain}`,\n"

/**
 * vite.config.ts: insert one `devUpstreams` entry above the `/user-api` entry
 * the template always carries (auth rides it), so the user service never
 * produces a duplicate.
 */
export function insertDevUpstream(content: string, key: string, service: ServiceConfig): string {
  if (key === 'user' || content.includes(`'/${key}-api':`)) return content
  if (!content.includes(USER_UPSTREAM))
    throw new Error('vite.config.ts: user-api upstream not found')
  return content.replace(
    USER_UPSTREAM,
    () => `${buildDevUpstreamEntry(key, service)}${USER_UPSTREAM}`,
  )
}

/*
 * A generated page is wired the way a hand-written one is: a lazy export, a route and a
 * navigation entry. Each insert below owns one of those three files. The user service is
 * never given a page — the template's access pages are its UI.
 */

const PAGES_ANCHOR = '// netix-pages:insert'
const ROUTES_ANCHOR = '              {/* netix-routes:insert */}'
const NAV_ANCHOR = '      // netix-nav:insert'

const insertAt = (content: string, file: string, anchor: string, entry: string): string => {
  if (!content.includes(anchor)) throw new Error(`${file}: ${anchor.trim()} anchor not found`)
  return content.replace(anchor, `${entry}${anchor}`)
}

/** app/pages/lazy.ts: insert one lazy export above the anchor. */
export function insertLazyPageEntry(content: string, key: string): string {
  const { importPath } = pageNames(key)
  if (key === 'user' || content.includes(`import('${importPath}')`)) return content
  return insertAt(content, 'app/pages/lazy.ts', PAGES_ANCHOR, buildLazyPageEntry(key))
}

/** app/main.tsx: insert one `<Route>` above the anchor, before the catch-all. */
export function insertRouteEntry(content: string, key: string): string {
  const { component } = pageNames(key)
  if (key === 'user' || content.includes(`<Pages.${component} />`)) return content
  return insertAt(content, 'app/main.tsx', ROUTES_ANCHOR, buildRouteEntry(key))
}

/** app/lib/navigation.ts: insert one workspace entry above the anchor. */
export function insertNavEntry(content: string, key: string, service: ServiceConfig): string {
  const { path } = pageNames(key)
  if (key === 'user' || content.includes(`path: '${path}',`)) return content
  return insertAt(content, 'app/lib/navigation.ts', NAV_ANCHOR, buildNavEntry(key, service))
}

const EMPTY_ORVAL = 'export default defineConfig({})'
const ORVAL_CLOSING = /^\}\)$/m

/** orval.config.ts: insert one generation block; no-op when the service already has one. */
export function insertOrvalBlock(content: string, key: string): string {
  const { slug } = serviceNames(key)
  if (content.includes(`'${slug}':`)) return content
  const block = buildOrvalBlock(key)
  if (content.includes(EMPTY_ORVAL))
    return content.replace(EMPTY_ORVAL, `export default defineConfig({\n${block}})`)
  if (content.includes('export default defineConfig({\n') && ORVAL_CLOSING.test(content))
    return content.replace(ORVAL_CLOSING, () => `${block}})`)
  throw new Error('orval.config.ts: defineConfig block not found')
}

/** app/config/env.ts: one `ENV.api` entry per selected service. */
export function rewriteEnvConfig(content: string, options: ScaffoldOptions): string {
  return options.services.reduce(
    (acc, key) => insertEnvApiEntry(acc, key, requireService(options, key)),
    content,
  )
}

/** vite.config.ts: one `devUpstreams` entry per selected service. */
export function rewriteViteProxy(content: string, options: ScaffoldOptions): string {
  return options.services.reduce(
    (acc, key) => insertDevUpstream(acc, key, requireService(options, key)),
    content,
  )
}

/** app/pages/lazy.ts: one lazy export per selected service. */
export function rewriteLazyPages(content: string, options: ScaffoldOptions): string {
  for (const key of options.services) requireService(options, key)
  return options.services.reduce((acc, key) => insertLazyPageEntry(acc, key), content)
}

/** app/main.tsx: one route per selected service. */
export function rewriteRoutes(content: string, options: ScaffoldOptions): string {
  for (const key of options.services) requireService(options, key)
  return options.services.reduce((acc, key) => insertRouteEntry(acc, key), content)
}

/** app/lib/navigation.ts: one workspace entry per selected service. */
export function rewriteNavigation(content: string, options: ScaffoldOptions): string {
  return options.services.reduce(
    (acc, key) => insertNavEntry(acc, key, requireService(options, key)),
    content,
  )
}

/** orval.config.ts: one generation block per selected service. */
export function rewriteOrvalConfig(content: string, options: ScaffoldOptions): string {
  for (const key of options.services) requireService(options, key)
  return options.services.reduce((acc, key) => insertOrvalBlock(acc, key), content)
}

export function rewriteComponentsJson(content: string, options: ScaffoldOptions): string {
  const config = JSON.parse(content) as { registries?: Record<string, unknown> }
  config.registries = { ...config.registries, '@netix': options.registryUrl }
  return `${JSON.stringify(config, null, 2)}\n`
}

/** README.md / docs/AGENTS.md: swap the template's identity for the app's. */
export function rewriteDocs(content: string, options: ScaffoldOptions): string {
  return content
    .replaceAll(TEMPLATE_NAME, options.name)
    .replaceAll('frontend-template', options.name)
}
