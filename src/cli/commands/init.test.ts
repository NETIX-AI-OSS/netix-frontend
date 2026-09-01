// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ExecResult, Runner } from '../exec'
import { init } from './init'

const clack = vi.hoisted(() => ({
  intro: vi.fn(),
  outro: vi.fn(),
  cancel: vi.fn(),
  note: vi.fn(),
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  spinner: () => ({ start: vi.fn(), stop: vi.fn() }),
  text: vi.fn(),
  confirm: vi.fn(),
  multiselect: vi.fn(),
  isCancel: vi.fn(() => false),
}))
vi.mock('@clack/prompts', () => clack)

const FIXTURE = fileURLToPath(new URL('../../../tests/fixtures/mini-template', import.meta.url))

const ok = (stdout = ''): ExecResult => ({ code: 0, stdout, stderr: '' })

const makeRunner = (failing: string[] = []) => {
  const calls: string[] = []
  const runner: Runner = async (command, args) => {
    const line = [command, ...args].join(' ')
    calls.push(line)
    if (failing.some((pattern) => line.includes(pattern)))
      return { code: 1, stdout: '', stderr: 'nope' }
    if (line.includes('/contents/')) return ok('openapi: 3.1.0\n')
    if (line.includes('/commits?')) return ok('2026-08-30T00:00:00Z\n')
    return ok()
  }
  return { calls, runner }
}

let parent: string

beforeEach(() => {
  vi.clearAllMocks()
  parent = mkdtempSync(join(tmpdir(), 'netix-init-'))
})

afterEach(() => rmSync(parent, { recursive: true, force: true }))

const flagsFor = (dir: string, over = {}) => ({
  dir,
  yes: true,
  templatePath: FIXTURE,
  services: 'data,cafm',
  ...over,
})

it('scaffolds end to end with --yes and runs every post-step', async () => {
  const dest = join(parent, 'ops-console-ui')
  const { calls, runner } = makeRunner()

  await expect(init(flagsFor(dest), runner)).resolves.toBe(0)

  expect(JSON.parse(readFileSync(join(dest, 'package.json'), 'utf8')).name).toBe('ops-console-ui')
  expect(existsSync(join(dest, 'app/client/http-cafm-service-client.ts'))).toBe(true)
  expect(readFileSync(join(dest, 'schema/cafm-service.yaml'), 'utf8')).toContain('openapi')
  expect(calls.some((line) => line.startsWith('git init'))).toBe(true)
  expect(calls.some((line) => line.startsWith('pnpm install'))).toBe(true)
  expect(calls.some((line) => line.startsWith('pnpm generate:client'))).toBe(true)
})

it('skips post-steps that were turned off', async () => {
  const dest = join(parent, 'quiet-ui')
  const { calls, runner } = makeRunner()

  await expect(
    init(flagsFor(dest, { git: false, install: false, schemas: false, generate: false }), runner),
  ).resolves.toBe(0)

  expect(calls.some((line) => line.startsWith('git init'))).toBe(false)
  expect(calls.some((line) => line.startsWith('pnpm install'))).toBe(false)
  expect(calls.some((line) => line.includes('/contents/'))).toBe(false)
})

it('keeps going when a post-step fails and says what to finish manually', async () => {
  const dest = join(parent, 'flaky-ui')
  const { runner } = makeRunner(['pnpm install'])

  await expect(init(flagsFor(dest), runner)).resolves.toBe(0)
  expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('finish manually'))
})

it('collects answers from prompts when flags are missing', async () => {
  const dest = join(parent, 'asked-ui')
  // Drive each prompt's validate too, so the inline validators are exercised.
  clack.text
    .mockImplementationOnce(async (opts: { validate?: (v?: string) => string | undefined }) => {
      expect(opts.validate?.('')).toBeTruthy()
      expect(opts.validate?.(dest)).toBeUndefined()
      return dest // directory
    })
    .mockImplementationOnce(
      async (opts: { validate?: (v?: string) => string | undefined; defaultValue?: string }) => {
        expect(opts.validate?.('Bad Name')).toBeTruthy()
        expect(opts.validate?.('asked-ui')).toBeUndefined()
        // empty is allowed: clack substitutes defaultValue, so validate must not reject it
        expect(opts.validate?.('')).toBeUndefined()
        expect(opts.defaultValue).toBe('asked-ui')
        return 'asked-ui' // name
      },
    )
    .mockResolvedValueOnce('Asked UI') // title
    .mockResolvedValueOnce('acme.dev') // base domain
  clack.multiselect.mockResolvedValueOnce(['data'])
  clack.confirm.mockResolvedValueOnce(true)
  const { runner } = makeRunner()

  await expect(init({ templatePath: FIXTURE }, runner)).resolves.toBe(0)
  expect(existsSync(join(dest, 'app/pages/profile.tsx'))).toBe(false)
  expect(readFileSync(join(dest, 'index.html'), 'utf8')).toContain('<title>Asked UI</title>')
})

it('suggests a title without the -ui plumbing suffix', async () => {
  const dest = join(parent, 'billing-console-ui')
  const seen: string[] = []
  clack.text.mockImplementation(async (opts: { message: string; defaultValue?: string }) => {
    seen.push(`${opts.message}=${opts.defaultValue ?? ''}`)
    return opts.defaultValue ?? dest
  })
  clack.multiselect.mockResolvedValueOnce(['data'])
  clack.confirm.mockResolvedValueOnce(false)

  await expect(init({ dir: dest, templatePath: FIXTURE }, makeRunner().runner)).resolves.toBe(0)
  expect(seen.some((s) => s === 'Display title=Billing Console')).toBe(true)
  expect(seen.some((s) => s.includes('Billing Console Ui'))).toBe(false)
  expect(readFileSync(join(dest, 'index.html'), 'utf8')).toContain('<title>Billing Console</title>')
})

it('cancels cleanly when the user aborts a prompt', async () => {
  const cancelToken = Symbol('cancel')
  clack.text.mockResolvedValueOnce(cancelToken)
  clack.isCancel.mockReturnValueOnce(true)
  const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)

  await expect(init({}, makeRunner().runner)).rejects.toBe(cancelToken)
  expect(clack.cancel).toHaveBeenCalledWith('init cancelled')
  expect(exit).toHaveBeenCalledWith(1)
  exit.mockRestore()
})

it('refuses a non-empty target directory', async () => {
  const dest = join(parent, 'taken')
  mkdirSync(dest)
  writeFileSync(join(dest, 'x'), '')
  await expect(init(flagsFor(dest), makeRunner().runner)).resolves.toBe(1)
})

it('refuses unknown services and non-kebab names', async () => {
  const { runner } = makeRunner()
  await expect(init(flagsFor(join(parent, 'a-ui'), { services: 'bogus' }), runner)).resolves.toBe(1)
  await expect(init(flagsFor(join(parent, 'b-ui'), { name: 'Bad Name' }), runner)).resolves.toBe(1)
})

it('reports a template acquisition failure', async () => {
  const dest = join(parent, 'no-template-ui')
  await expect(
    init(flagsFor(dest, { templatePath: '/not/a/real/template' }), makeRunner().runner),
  ).resolves.toBe(1)
  expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('template path not found'))
})
