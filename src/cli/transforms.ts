/**
 * Pure text transforms `netix init` applies to a fresh copy of frontend-template.
 * Every function is (content, options) → content so the whole scaffold pipeline is
 * unit-testable against verbatim template fixtures — no fs, no network, no prompts.
 */

import { LIB_REPO } from './refs'

export type ServiceConfig = {
  title: string
  backendRepo: string
  specPath: string
  localPort: number
  envVar: string
  apiSubdomain: string
}

export type ServicesManifest = { services: Record<string, ServiceConfig> }

export type ScaffoldOptions = {
  /** kebab-case app name, e.g. "asset-console-ui" — also the deploy identity. */
  name: string
  /** Human title for index.html and docs. */
  title: string
  baseDomain: string
  /** Selected service keys from the manifest, e.g. ["data", "cafm"]. */
  services: string[]
  manifest: ServicesManifest
  /** Git ref for the netix-frontend dependency, e.g. "v2.0.0". */
  libRef: string
  /** URL template for the @netix registry, with a literal `{name}` placeholder. */
  registryUrl: string
}

/** Naming forms derived from a service key: "cafm" → cafm-service / CAFM_SERVICE / CafmService. */
export function serviceNames(key: string) {
  const slug = `${key}-service`
  const screaming = slug.toUpperCase().replaceAll('-', '_')
  const pascal = slug
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join('')
  return { key, slug, screaming, pascal }
}

const TEMPLATE_NAME = 'cookie-cutter-ui'

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

/** Files whose on-disk names carry the deploy identity. */
export function deployRenames(options: ScaffoldOptions): Record<string, string> {
  return {
    'app-ui-deployment.yaml': `${options.name}-deployment.yaml`,
    'app-ui-ingress.yaml': `${options.name}-ingress.yaml`,
  }
}

const SERVICE_ENV_LINE = /^VITE_[A-Z_]+_SERVICE_BASE_URL=.*\n?/gm

export function rewriteEnv(content: string, options: ScaffoldOptions): string {
  const withoutServices = content
    .replace(/^BASE_DOMAIN=.*$/m, `BASE_DOMAIN=${options.baseDomain}`)
    .replace(SERVICE_ENV_LINE, '')
    .trimEnd()
  const serviceLines = options.services.map((key) => {
    const service = options.manifest.services[key]
    if (!service) throw new Error(`unknown service: ${key}`)
    return `${service.envVar}=https://${service.apiSubdomain}.\${BASE_DOMAIN}`
  })
  return `${[withoutServices, ...serviceLines].join('\n')}\n`
}

/** .env.example mirrors .env; secrets already ship as REPLACE_ME placeholders. */
export function buildEnvExample(envContent: string): string {
  return envContent
}

export function rewriteViteEnv(content: string, options: ScaffoldOptions): string {
  const lines = options.services
    .map((key) => options.manifest.services[key]?.envVar)
    .filter(Boolean)
    .map((envVar) => `  readonly ${envVar}: string`)
  const withoutServices = content.replace(
    /^ {2}readonly VITE_[A-Z_]+_SERVICE_BASE_URL: string\n/gm,
    '',
  )
  return withoutServices.replace(
    /^( {2}readonly VITE_DEV_MODE: string)$/m,
    [`$1`, ...lines].join('\n'),
  )
}

export function buildLocalDevUrls(options: ScaffoldOptions): string {
  const lines = options.services.map((key) => {
    const service = options.manifest.services[key]
    if (!service) throw new Error(`unknown service: ${key}`)
    const { screaming } = serviceNames(key)
    return `export const LOCAL_DEV_${screaming}_BASE_URL = 'http://localhost:${service.localPort}/'`
  })
  return [
    '/** Localhost fallback for local dev; prefer `VITE_*` env vars outside dev mode. */',
    ...lines,
    '',
  ].join('\n')
}

/** Clones the template's data-service client for another service by renaming its forms. */
export function buildServiceClient(dataClientContent: string, key: string): string {
  const { slug, screaming, pascal } = serviceNames(key)
  return dataClientContent
    .replaceAll('data-service', slug)
    .replaceAll('DATA_SERVICE', screaming)
    .replaceAll('DataService', pascal)
}

const ORVAL_BLOCK = /^ {2}'data-service': \{[\s\S]*?\n {2}\},/m

export function rewriteOrvalConfig(content: string, options: ScaffoldOptions): string {
  const match = content.match(ORVAL_BLOCK)
  if (!match) throw new Error('orval.config.ts: data-service block not found')
  const blocks = options.services.map((key) => buildServiceClient(match[0], key))
  return content.replace(ORVAL_BLOCK, blocks.join('\n'))
}

export function rewriteComponentsJson(content: string, options: ScaffoldOptions): string {
  const config = JSON.parse(content) as { registries?: Record<string, unknown> }
  config.registries = { ...config.registries, '@netix': options.registryUrl }
  return `${JSON.stringify(config, null, 2)}\n`
}

/** README/CLAUDE.md/AGENTS.md: swap the template's identity for the app's. */
export function rewriteDocs(content: string, options: ScaffoldOptions): string {
  return content
    .replaceAll(TEMPLATE_NAME, options.name)
    .replaceAll('frontend-template', options.name)
}

export const DEMO_PAGES = ['profile', 'permissions', 'security', 'support'] as const

const demoPagePattern = DEMO_PAGES.join('|')

/** Drops demo-page exports from app/pages/lazy.ts. */
export function stripLazyBarrel(content: string): string {
  const byLine = content
    .split('\n')
    .filter((line) => !new RegExp(`/(${demoPagePattern})'`).test(line))
  return byLine.join('\n')
}

/**
 * Drops the demo <Route> blocks from app/main.tsx. The template writes each route as a
 * multi-line self-closing element, so this scans by indentation instead of regex-matching
 * across the nested `/>`s inside the element body.
 */
export function stripRoutes(content: string): string {
  const demoPath = new RegExp(`^\\s*path="/(?:${demoPagePattern})"`)
  const singleLine = new RegExp(`^\\s*<Route\\b.*path="/(?:${demoPagePattern})".*/>\\s*$`)
  const lines = content.split('\n')
  const kept: string[] = []
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? ''
    const opening = line.match(/^(\s*)<Route$/)
    if (opening && demoPath.test(lines[index + 1] ?? '')) {
      const closing = `${opening[1]}/>`
      while (index < lines.length && lines[index] !== closing) index++
      continue
    }
    if (singleLine.test(line)) continue
    kept.push(line)
  }
  return kept.join('\n')
}

/** Drops demo-page imports (lazy barrel names) that stripRoutes orphaned in main.tsx. */
export function stripRouteImports(content: string): string {
  const names = ['ProfilePage', 'PermissionsPage', 'SecurityPage', 'SupportPage']
  let result = content
  for (const name of names) {
    result = result.replace(new RegExp(`^import .*\\b${name}\\b.*\\n`, 'm'), '')
    result = result.replace(new RegExp(`\\s*${name},`, 'g'), '')
  }
  return result
}
