import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { run, type Runner } from '../exec'
import { serviceNames, type ServicesManifest } from '../transforms'

const STALE_AFTER_DAYS = 90
const DAY_MS = 24 * 60 * 60 * 1000

export type SchemaPullOptions = {
  cwd: string
  manifest: ServicesManifest
  /** Service keys; when empty, detected from existing schema/<key>-service.yaml files. */
  services?: string[]
  dryRun?: boolean
  runner?: Runner
  log?: (line: string) => void
  /** Injectable clock for tests. */
  now?: () => number
}

export type SchemaPullResult = {
  pulled: string[]
  warnings: string[]
  failures: string[]
}

/** Services an app already uses, read from its schema/ directory. */
export function detectServices(cwd: string, manifest: ServicesManifest): string[] {
  const dir = join(cwd, 'schema')
  if (!existsSync(dir)) return []
  const known = Object.keys(manifest.services)
  return readdirSync(dir)
    .map((file) => file.replace(/-service\.ya?ml$/, ''))
    .filter((key, index, all) => known.includes(key) && all.indexOf(key) === index)
}

export async function schemaPull({
  cwd,
  manifest,
  services = [],
  dryRun = false,
  runner = run,
  log = () => {},
  now = Date.now,
}: SchemaPullOptions): Promise<SchemaPullResult> {
  const keys = services.length ? services : detectServices(cwd, manifest)
  const result: SchemaPullResult = { pulled: [], warnings: [], failures: [] }
  if (!keys.length) {
    result.warnings.push('no services selected and none detected under schema/')
    return result
  }

  for (const key of keys) {
    const service = manifest.services[key]
    if (!service) {
      result.failures.push(`${key}: unknown service (not in services.json)`)
      continue
    }
    const target = `schema/${serviceNames(key).slug}.yaml`
    if (dryRun) {
      log(`${key}: would pull ${service.backendRepo}/${service.specPath} → ${target}`)
      result.pulled.push(key)
      continue
    }

    const spec = await runner('gh', [
      'api',
      '-H',
      'Accept: application/vnd.github.raw',
      `repos/${service.backendRepo}/contents/${service.specPath}`,
    ])
    if (spec.code !== 0 || !spec.stdout.trim()) {
      result.failures.push(`${key}: fetching ${service.backendRepo}/${service.specPath} failed`)
      continue
    }
    mkdirSync(join(cwd, 'schema'), { recursive: true })
    writeFileSync(join(cwd, target), spec.stdout)
    result.pulled.push(key)
    log(`${key}: pulled ${service.backendRepo}/${service.specPath} → ${target}`)

    const commit = await runner('gh', [
      'api',
      `repos/${service.backendRepo}/commits?path=${service.specPath}&per_page=1`,
      '--jq',
      '.[0].commit.committer.date',
    ])
    const date = Date.parse(commit.stdout.trim())
    if (commit.code === 0 && !Number.isNaN(date)) {
      const ageDays = Math.floor((now() - date) / DAY_MS)
      if (ageDays > STALE_AFTER_DAYS)
        result.warnings.push(
          `${key}: spec last touched ${ageDays} days ago — the backend snapshot may be stale`,
        )
    }
  }
  return result
}
