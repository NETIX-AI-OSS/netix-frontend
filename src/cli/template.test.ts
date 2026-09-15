// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { ExecResult, Runner } from './exec'
import { acquireTemplate, newestReleaseTag, resolveTemplate } from './template'

const ok = (stdout = ''): ExecResult => ({ code: 0, stdout, stderr: '' })
const fail = (stderr = 'nope'): ExecResult => ({ code: 1, stdout: '', stderr })

let dest: string

beforeEach(() => {
  dest = mkdtempSync(join(tmpdir(), 'netix-template-'))
})

afterEach(() => rmSync(dest, { recursive: true, force: true }))

describe('local template path', () => {
  it('copies the tree but not .git/node_modules/dist', async () => {
    const source = mkdtempSync(join(tmpdir(), 'netix-src-'))
    writeFileSync(join(source, 'package.json'), '{}')
    mkdirSync(join(source, 'app'))
    writeFileSync(join(source, 'app/main.tsx'), '')
    for (const skip of ['.git', 'node_modules', 'dist']) {
      mkdirSync(join(source, skip))
      writeFileSync(join(source, skip, 'x'), '')
    }

    const { source: label } = await acquireTemplate({ dest, ref: 'unused', templatePath: source })
    expect(label).toBe(source)
    expect(existsSync(join(dest, 'package.json'))).toBe(true)
    expect(existsSync(join(dest, 'app/main.tsx'))).toBe(true)
    for (const skip of ['.git', 'node_modules', 'dist'])
      expect(existsSync(join(dest, skip))).toBe(false)
    rmSync(source, { recursive: true, force: true })
  })

  it('rejects a missing path', async () => {
    await expect(
      acquireTemplate({ dest, ref: 'x', templatePath: '/definitely/not/here' }),
    ).rejects.toThrow('template path not found')
  })
})

describe('github tarball path', () => {
  it('requires gh', async () => {
    const runner: Runner = async () => fail()
    await expect(acquireTemplate({ dest, ref: 'v1', runner })).rejects.toThrow(
      'GitHub CLI (gh) is required',
    )
  })

  it('requires gh auth', async () => {
    const runner: Runner = async (_, args) =>
      args.join(' ').includes('command -v gh') ? ok('/usr/bin/gh') : fail()
    await expect(acquireTemplate({ dest, ref: 'v1', runner })).rejects.toThrow('not authenticated')
  })

  it('downloads via gh api piped into tar', async () => {
    const calls: string[] = []
    const runner: Runner = async (_, args) => {
      calls.push(args.join(' '))
      return ok('ok')
    }
    const { source } = await acquireTemplate({ dest, ref: 'v9.9.9', runner })
    expect(source).toBe('NETIX-AI/frontend-template@v9.9.9')
    expect(calls.at(-1)).toContain('gh api repos/NETIX-AI/frontend-template/tarball/v9.9.9')
    expect(calls.at(-1)).toContain(`tar -xz --strip-components=1 -C '${dest}'`)
  })

  it('surfaces a tarball failure', async () => {
    const runner: Runner = async (_, args) =>
      args.join(' ').includes('tarball') ? fail('404') : ok('ok')
    await expect(acquireTemplate({ dest, ref: 'v1', runner })).rejects.toThrow('404')
  })
})

describe('newestReleaseTag', () => {
  it('picks the highest vX.Y.Z tag in numeric order, ignoring everything else', () => {
    expect(newestReleaseTag(['v1.0.1', 'v1.10.0', 'v1.9.0', 'v2.0.0-rc.1', 'main', ''])).toBe(
      'v1.10.0',
    )
  })

  it('is undefined when no tag is a release', () => {
    expect(newestReleaseTag(['main', 'v2.0.0-rc.1'])).toBeUndefined()
    expect(newestReleaseTag([])).toBeUndefined()
  })
})

describe('resolveTemplate (preflight, before any prompt)', () => {
  const only =
    (pattern: string, result: ExecResult = fail()): Runner =>
    async (_, args) =>
      args.join(' ').includes(pattern) ? result : ok('ok')

  it('passes for an existing local template path', async () => {
    const source = mkdtempSync(join(tmpdir(), 'netix-src-'))
    await expect(resolveTemplate({ templatePath: source })).resolves.toEqual({ ref: 'local' })
    rmSync(source, { recursive: true, force: true })
  })

  it('reports a missing local template path', async () => {
    await expect(resolveTemplate({ templatePath: '/nope' })).resolves.toEqual({
      error: expect.stringContaining('template path not found'),
    })
  })

  it('reports missing gh and missing auth before touching the repo', async () => {
    await expect(resolveTemplate({ runner: only('command -v gh') })).resolves.toEqual({
      error: expect.stringContaining('GitHub CLI (gh) is required'),
    })
    await expect(resolveTemplate({ runner: only('auth status') })).resolves.toEqual({
      error: expect.stringContaining('not authenticated'),
    })
  })

  it('keeps an explicit --template-ref, checking that gh can see it', async () => {
    const calls: string[] = []
    const runner: Runner = async (_, args) => {
      calls.push(args.join(' '))
      return ok('ok')
    }
    await expect(resolveTemplate({ ref: 'v1.0.0', runner })).resolves.toEqual({ ref: 'v1.0.0' })
    expect(calls.at(-1)).toContain('api repos/NETIX-AI/frontend-template/commits/v1.0.0')
    expect(calls.join('\n')).not.toContain('/tags')

    await expect(resolveTemplate({ ref: 'v1', runner: only('commits/') })).resolves.toEqual({
      error: expect.stringContaining('is not reachable'),
    })
  })

  it('resolves the newest release tag when no ref is given', async () => {
    const runner = only('/tags', ok('v1.0.0\nv1.0.1\nv1.10.0\nv1.9.0\nv2.0.0-rc.1\n'))
    await expect(resolveTemplate({ runner })).resolves.toEqual({ ref: 'v1.10.0' })
  })

  it('reports a template with no release tag, and a failed tag listing', async () => {
    await expect(resolveTemplate({ runner: only('/tags', ok('main\n')) })).resolves.toEqual({
      error: expect.stringContaining('has no vX.Y.Z tag'),
    })
    await expect(resolveTemplate({ runner: only('/tags', fail('403')) })).resolves.toEqual({
      error: expect.stringContaining('listing NETIX-AI/frontend-template tags failed'),
    })
  })
})
