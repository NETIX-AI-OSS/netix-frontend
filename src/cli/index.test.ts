// @vitest-environment node
import { main } from './index'

const initMock = vi.hoisted(() => vi.fn(async () => 0))
const addMock = vi.hoisted(() => vi.fn(async () => 0))
const pullMock = vi.hoisted(() =>
  vi.fn(async () => ({ pulled: ['data'], warnings: ['old spec'], failures: [] as string[] })),
)
vi.mock('./commands/init', () => ({ init: initMock }))
vi.mock('./commands/add', () => ({ addItems: addMock }))
vi.mock('./commands/schema-pull', () => ({ schemaPull: pullMock }))

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
    main(['init', './my-ui', '--services', 'data,cafm', '--strip-demo', '--yes', '--no-install']),
  ).resolves.toBe(0)
  expect(initMock).toHaveBeenCalledWith(
    expect.objectContaining({
      dir: './my-ui',
      services: 'data,cafm',
      stripDemo: true,
      yes: true,
      install: false,
      git: true,
    }),
  )
})

it('routes add items and passthrough flags, and requires at least one item', async () => {
  await expect(main(['add'])).resolves.toBe(1)
  await expect(main(['add', 'use-tabs', 'data-table', '--overwrite'])).resolves.toBe(0)
  expect(addMock).toHaveBeenCalledWith(['use-tabs', 'data-table'], ['--overwrite'])
})

it('routes schema pull, prints warnings, and fails when a pull fails', async () => {
  await expect(main(['schema', 'pull', 'data', '--dry-run'])).resolves.toBe(0)
  expect(pullMock).toHaveBeenCalledWith(
    expect.objectContaining({ services: ['data'], dryRun: true }),
  )
  expect(stderr.join('')).toContain('old spec')

  pullMock.mockResolvedValueOnce({ pulled: [], warnings: [], failures: ['data: fetch failed'] })
  await expect(main(['schema', 'pull'])).resolves.toBe(1)
})
