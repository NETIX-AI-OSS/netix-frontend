// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { ExecResult, Runner } from './exec'
import { acquireTemplate } from './template'

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
    const { source } = await acquireTemplate({ dest, ref: 'template-v9', runner })
    expect(source).toBe('4T5Labs/frontend-template@template-v9')
    expect(calls.at(-1)).toContain('gh api repos/4T5Labs/frontend-template/tarball/template-v9')
    expect(calls.at(-1)).toContain(`tar -xz --strip-components=1 -C '${dest}'`)
  })

  it('surfaces a tarball failure', async () => {
    const runner: Runner = async (_, args) =>
      args.join(' ').includes('tarball') ? fail('404') : ok('ok')
    await expect(acquireTemplate({ dest, ref: 'v1', runner })).rejects.toThrow('404')
  })
})
