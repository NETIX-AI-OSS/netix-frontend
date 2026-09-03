// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtempSync, realpathSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { isEntryPoint, main } from './index'

const initMock = vi.hoisted(() => vi.fn(async () => 0))
const addMock = vi.hoisted(() => vi.fn(async () => 0))
const pullMock = vi.hoisted(() =>
  vi.fn(async (opts?: { log?: (line: string) => void }) => {
    opts?.log?.('data: pulled')
    return { pulled: ['data'], warnings: ['old spec'], failures: [] as string[] }
  }),
)
const serviceAddMock = vi.hoisted(() => vi.fn(async () => 0))
vi.mock('./commands/init', () => ({ init: initMock }))
vi.mock('./commands/add', () => ({ addItems: addMock }))
vi.mock('./commands/schema-pull', () => ({ schemaPull: pullMock }))
vi.mock('./commands/service-add', () => ({ serviceAdd: serviceAddMock }))

let stdout: string[]
let stderr: string[]

beforeEach(() => {
  vi.clearAllMocks()
  stdout = []
  stderr = []
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout.push(String(chunk))
    return true
  })
  vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
    stderr.push(String(chunk))
    return true
  })
})

afterEach(() => vi.restoreAllMocks())

it('prints help with no command and on --help', async () => {
  await expect(main([])).resolves.toBe(0)
  await expect(main(['--help'])).resolves.toBe(0)
  expect(stdout.join('')).toContain('netix init [dir]')
})

it('prints the package version', async () => {
  await expect(main(['--version'])).resolves.toBe(0)
  expect(stdout.join('')).toMatch(/^\d+\.\d+\.\d+/m)
})

it('rejects unknown commands with the usage text', async () => {
  await expect(main(['frobnicate'])).resolves.toBe(1)
  expect(stderr.join('')).toContain('unknown command: frobnicate')
})

it('routes init flags through', async () => {
  await expect(
    main(['init', './my-ui', '--services', 'data,cafm', '--yes', '--no-install']),
  ).resolves.toBe(0)
  expect(initMock).toHaveBeenCalledWith(
    expect.objectContaining({
      dir: './my-ui',
      services: 'data,cafm',
      yes: true,
      install: false,
      git: true,
    }),
  )
})

it('routes add items and passthrough flags, and requires at least one item', async () => {
  await expect(main(['add'])).resolves.toBe(1)
  await expect(main(['add', 'pagination-controls', 'data-table', '--overwrite'])).resolves.toBe(0)
  expect(addMock).toHaveBeenCalledWith(['pagination-controls', 'data-table'], ['--overwrite'])
})

it('routes service add with comma- or space-separated names and the skip flags', async () => {
  await expect(main(['service', 'add', 'data,cafm', 'asset', '--no-generate'])).resolves.toBe(0)
  expect(serviceAddMock).toHaveBeenCalledWith(
    expect.objectContaining({
      services: ['data', 'cafm', 'asset'],
      schemas: true,
      generate: false,
    }),
  )
})

it('routes schema pull, prints warnings, and fails when a pull fails', async () => {
  await expect(main(['schema', 'pull', 'data,cafm', 'data', '--dry-run'])).resolves.toBe(0)
  expect(pullMock).toHaveBeenCalledWith(
    // Comma and space both separate; the duplicate "data" collapses.
    expect.objectContaining({ services: ['data', 'cafm'], dryRun: true, generate: true }),
  )
  expect(stderr.join('')).toContain('old spec')

  pullMock.mockResolvedValueOnce({ pulled: [], warnings: [], failures: ['data: fetch failed'] })
  await expect(main(['schema', 'pull', '--no-generate'])).resolves.toBe(1)
  expect(pullMock).toHaveBeenLastCalledWith(expect.objectContaining({ generate: false }))
})

describe('isEntryPoint', () => {
  const self = realpathSync(resolve('src/cli/index.ts'))

  test('matches when the entry path is this module', () => {
    expect(isEntryPoint(self, pathToFileURL(self).href)).toBe(true)
  })

  test('matches through a symlink, which is how npm installs the bin', () => {
    const link = join(mkdtempSync(join(tmpdir(), 'netix-bin-')), 'netix')
    symlinkSync(self, link)
    expect(isEntryPoint(link, pathToFileURL(self).href)).toBe(true)
  })

  test('does not match another module, or a missing path', () => {
    expect(isEntryPoint(self, pathToFileURL(resolve('src/cli/refs.ts')).href)).toBe(false)
    expect(isEntryPoint(join(tmpdir(), 'netix-absent'), pathToFileURL(self).href)).toBe(false)
    expect(isEntryPoint(undefined, pathToFileURL(self).href)).toBe(false)
  })
})

// The bug this guards: invoked through node_modules/.bin/netix the CLI exited 0
// printing nothing, so every installed copy of v2.0.0 and v2.0.1 was inert.
test('the built bin prints usage when run through a .bin symlink', () => {
  const bin = realpathSync(resolve('dist/cli/index.js'))
  const link = join(mkdtempSync(join(tmpdir(), 'netix-dist-')), 'netix')
  symlinkSync(bin, link)
  expect(execFileSync(process.execPath, [link], { encoding: 'utf8' })).toContain('netix init')
})
