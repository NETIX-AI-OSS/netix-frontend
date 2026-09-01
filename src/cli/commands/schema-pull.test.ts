// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { ExecResult, Runner } from '../exec'
import { loadManifest } from '../services'
import { detectServices, schemaPull } from './schema-pull'

const manifest = loadManifest()

const ok = (stdout: string): ExecResult => ({ code: 0, stdout, stderr: '' })
const fail = (stderr = 'boom'): ExecResult => ({ code: 1, stdout: '', stderr })

const FRESH = '2026-08-30T00:00:00Z'
const STALE = '2025-01-01T00:00:00Z'
const NOW = Date.parse('2026-09-01T00:00:00Z')

const makeRunner = (
  spec: ExecResult,
  commitDate = FRESH,
): { calls: string[][]; runner: Runner } => {
  const calls: string[][] = []
  const runner: Runner = async (command, args) => {
    calls.push([command, ...args])
    if (args.some((arg) => arg.includes('/contents/'))) return spec
    if (args.some((arg) => arg.includes('/commits?'))) return ok(`${commitDate}\n`)
    return ok('')
  }
  return { calls, runner }
}

let cwd: string

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'netix-schema-'))
})

afterEach(() => rmSync(cwd, { recursive: true, force: true }))

describe('detectServices', () => {
  it('reads service keys from existing schema files', () => {
    mkdirSync(join(cwd, 'schema'))
    writeFileSync(join(cwd, 'schema/cafm-service.yaml'), '')
    writeFileSync(join(cwd, 'schema/data-service.yaml'), '')
    writeFileSync(join(cwd, 'schema/unrelated.txt'), '')
    expect(detectServices(cwd, manifest).sort()).toEqual(['cafm', 'data'])
  })

  it('returns nothing without a schema directory', () => {
    expect(detectServices(cwd, manifest)).toEqual([])
  })
})

it('pulls specs, writes them and reports success', async () => {
  const { runner } = makeRunner(ok('openapi: 3.1.0\n'))
  const result = await schemaPull({ cwd, manifest, services: ['cafm'], runner, now: () => NOW })
  expect(result.pulled).toEqual(['cafm'])
  expect(result.failures).toEqual([])
  expect(result.warnings).toEqual([])
  expect(readFileSync(join(cwd, 'schema/cafm-service.yaml'), 'utf8')).toBe('openapi: 3.1.0\n')
})

it('warns when the backend snapshot is stale', async () => {
  const { runner } = makeRunner(ok('openapi: 3.1.0\n'), STALE)
  const result = await schemaPull({ cwd, manifest, services: ['data'], runner, now: () => NOW })
  expect(result.warnings[0]).toContain('may be stale')
})

it('records a failure when the fetch errors and keeps going', async () => {
  const { runner } = makeRunner(fail())
  const result = await schemaPull({
    cwd,
    manifest,
    services: ['cafm', 'nope'],
    runner,
    now: () => NOW,
  })
  expect(result.failures).toHaveLength(2)
  expect(result.failures[1]).toContain('unknown service')
  expect(existsSync(join(cwd, 'schema/cafm-service.yaml'))).toBe(false)
})

it('describes the plan without touching the network on --dry-run', async () => {
  const lines: string[] = []
  const { calls, runner } = makeRunner(ok('unused'))
  const result = await schemaPull({
    cwd,
    manifest,
    services: ['user'],
    dryRun: true,
    runner,
    log: (line) => lines.push(line),
    now: () => NOW,
  })
  expect(result.pulled).toEqual(['user'])
  expect(calls).toEqual([])
  expect(lines[0]).toContain('NETIX-AI/user-management')
})

it('detects services from disk when none are passed, and warns when none exist', async () => {
  const empty = await schemaPull({
    cwd,
    manifest,
    runner: makeRunner(ok('x')).runner,
    now: () => NOW,
  })
  expect(empty.warnings[0]).toContain('no services selected')

  mkdirSync(join(cwd, 'schema'))
  writeFileSync(join(cwd, 'schema/notification-service.yaml'), '')
  const { runner } = makeRunner(ok('openapi: 3.1.0\n'))
  const detected = await schemaPull({ cwd, manifest, runner, now: () => NOW })
  expect(detected.pulled).toEqual(['notification'])
})
