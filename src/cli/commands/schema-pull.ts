import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { run, type Runner } from '../exec'
import { serviceNames, type ServicesManifest } from '../transforms'

const STALE_AFTER_DAYS = 90
const DAY_MS = 24 * 60 * 60 * 1000

export type SchemaPullOptions = {
  cwd: string
  manifest: ServicesManifest
  /** Service keys; when empty, every wired service (see detectServices). */
  services?: string[]
  dryRun?: boolean
  /** Run `pnpm generate:client` after pulling, so specs and clients move together. */
  generate?: boolean
  runner?: Runner
  log?: (line: string) => void
  /** Injectable clock for tests. */
  now?: () => number
}

export type SchemaPullResult = {
  pulled: string[]
  warnings: string[]
  failures: string[]
  generated: boolean
}

/**
 * Services an app is wired to: its orval.config.ts blocks, plus any
 * schema/<key>-service.yaml already on disk. Orval is the primary signal so a
 * service whose very first pull failed (wired, but no yaml yet) is still found.
 */
export function detectServices(cwd: string, manifest: ServicesManifest): string[] {
  const known = Object.keys(manifest.services)
  const found = new Set<string>()

  const orvalFile = join(cwd, 'orval.config.ts')
  if (existsSync(orvalFile)) {
    const orval = readFileSync(orvalFile, 'utf8')
    for (const key of known) if (orval.includes(`'${serviceNames(key).slug}':`)) found.add(key)
  }

  const dir = join(cwd, 'schema')
  if (existsSync(dir))
    for (const file of readdirSync(dir)) {
      const key = file.replace(/-service\.ya?ml$/, '')
      if (known.includes(key)) found.add(key)
    }

  return known.filter((key) => found.has(key))
}

export async function schemaPull({
  cwd,
  manifest,
  services = [],
  dryRun = false,
  generate = false,
  runner = run,
  log = () => {},
  now = Date.now,
}: SchemaPullOptions): Promise<SchemaPullResult> {
  const keys = services.length ? services : detectServices(cwd, manifest)
  const result: SchemaPullResult = { pulled: [], warnings: [], failures: [], generated: false }
  if (!keys.length) {
    result.warnings.push('no services selected and none wired in this app')
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

  // Regenerate even when some pulls failed: the ones that landed should not
  // wait on the ones that didn't, and the exit code already carries the failures.
  if (generate && !dryRun && result.pulled.length) {
    log('pnpm generate:client')
    const gen = await runner('pnpm', ['generate:client'], { cwd })
    if (gen.code === 0) result.generated = true
    else result.failures.push('pnpm generate:client failed — rerun it once the cause is fixed')
  }
  return result
}
