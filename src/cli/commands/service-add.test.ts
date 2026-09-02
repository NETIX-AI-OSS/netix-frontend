// @vitest-environment node
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ExecResult, Runner } from '../exec'
import { serviceAdd } from './service-add'

const clack = vi.hoisted(() => ({
  intro: vi.fn(),
  outro: vi.fn(),
  cancel: vi.fn(),
  note: vi.fn(),
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  spinner: () => ({ start: vi.fn(), stop: vi.fn() }),
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

let root: string

beforeEach(() => {
  vi.clearAllMocks()
  root = mkdtempSync(join(tmpdir(), 'netix-service-add-'))
  cpSync(FIXTURE, root, { recursive: true })
})

afterEach(() => rmSync(root, { recursive: true, force: true }))

const read = (path: string) => readFileSync(join(root, path), 'utf8')

it('wires the named services, pulls their schemas and generates the clients', async () => {
  const { calls, runner } = makeRunner()

  await expect(serviceAdd({ services: ['cafm'], cwd: root }, runner)).resolves.toBe(0)

  expect(read('app/client/http-cafm-service-client.ts')).toContain('httpCafmServiceClient')
  expect(read('orval.config.ts')).toContain("'cafm-service': {")
  expect(read('app/config/env.ts')).toContain("cafmService: serviceUrl('cafm.api', '/cafm-api')")
  expect(read('vite.config.ts')).toContain("'/cafm-api'")
  expect(read('app/pages/cafm.tsx')).toContain('export default function CafmPage()')
  expect(read('app/pages/lazy.ts')).toContain("import('@/pages/cafm')")
  expect(read('app/main.tsx')).toContain('<Pages.CafmPage />')
  expect(read('app/lib/navigation.ts')).toContain("path: '/workspace/cafm',")
  expect(read('schema/cafm-service.yaml')).toContain('openapi')
  expect(calls.some((line) => line.startsWith('pnpm generate:client'))).toBe(true)
})

it('only refreshes on a second run: nothing duplicates, nothing is overwritten', async () => {
  await serviceAdd({ services: ['cafm'], cwd: root }, makeRunner().runner)
  const { calls, runner } = makeRunner()

  await expect(serviceAdd({ services: ['cafm'], cwd: root }, runner)).resolves.toBe(0)

  expect(read('vite.config.ts').match(/'\/cafm-api':/g)).toHaveLength(1)
  expect(read('orval.config.ts').match(/'cafm-service':/g)).toHaveLength(1)
  expect(read('app/pages/lazy.ts').match(/CafmPage/g)).toHaveLength(1)
  expect(read('app/main.tsx').match(/<Pages\.CafmPage \/>/g)).toHaveLength(1)
  expect(read('app/lib/navigation.ts').match(/'\/workspace\/cafm'/g)).toHaveLength(1)
  expect(calls.some((line) => line.includes('/contents/'))).toBe(true)
  expect(clack.log.info).toHaveBeenCalledWith(
    'kept app/client/http-cafm-service-client.ts (already exists)',
  )
})

it('asks with a multiselect when no services are named', async () => {
  clack.multiselect.mockResolvedValueOnce(['data'])

  await expect(serviceAdd({ services: [], cwd: root }, makeRunner().runner)).resolves.toBe(0)

  expect(read('app/config/env.ts')).toContain('dataService')
  const { options } = clack.multiselect.mock.calls[0]?.[0] as {
    options: Array<{ value: string }>
  }
  expect(options.map((option) => option.value)).toContain('cafm')
})

it('cancels cleanly when the prompt is aborted', async () => {
  const cancelToken = Symbol('cancel')
  clack.multiselect.mockResolvedValueOnce(cancelToken)
  clack.isCancel.mockReturnValueOnce(true)
  const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)

  await expect(serviceAdd({ services: [], cwd: root }, makeRunner().runner)).rejects.toBe(
    cancelToken,
  )
  expect(clack.cancel).toHaveBeenCalledWith('service add cancelled')
  exit.mockRestore()
})

it('refuses --yes without names, unknown services, and a directory that is no app', async () => {
  const { runner } = makeRunner()
  await expect(serviceAdd({ services: [], yes: true, cwd: root }, runner)).resolves.toBe(1)
  await expect(serviceAdd({ services: ['bogus'], cwd: root }, runner)).resolves.toBe(1)
  expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('unknown services: bogus'))

  const notAnApp = mkdtempSync(join(tmpdir(), 'netix-not-an-app-'))
  await expect(serviceAdd({ services: ['data'], cwd: notAnApp }, runner)).resolves.toBe(1)
  rmSync(notAnApp, { recursive: true, force: true })
})

it('fails cleanly when an anchor file is missing from the app', async () => {
  rmSync(join(root, 'app/config/env.ts'))
  await expect(serviceAdd({ services: ['data'], cwd: root }, makeRunner().runner)).resolves.toBe(1)
  expect(clack.log.error).toHaveBeenCalledWith(
    expect.stringContaining('app/config/env.ts not found'),
  )
})

it('skips the steps that were turned off', async () => {
  const { calls, runner } = makeRunner()

  await expect(
    serviceAdd({ services: ['data'], cwd: root, schemas: false, generate: false }, runner),
  ).resolves.toBe(0)

  expect(calls).toEqual([])
  expect(read('orval.config.ts')).toContain("'data-service': {")
  expect(clack.log.info).toHaveBeenCalledWith('skipped: schema pull, pnpm generate:client')
})

it('reports a failed step and exits non-zero', async () => {
  const { runner } = makeRunner(['pnpm generate:client'])

  await expect(serviceAdd({ services: ['data'], cwd: root }, runner)).resolves.toBe(1)

  expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('finish manually'))
})
