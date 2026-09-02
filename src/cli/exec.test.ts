// @vitest-environment node
import { hasCommand, run, runShell } from './exec'

it('runs a command and captures stdout with exit 0', async () => {
  const result = await run('/bin/sh', ['-c', 'echo hello'])
  expect(result).toMatchObject({ code: 0 })
  expect(result.stdout.trim()).toBe('hello')
})

it('respects the cwd option', async () => {
  const result = await run('/bin/sh', ['-c', 'pwd'], { cwd: '/tmp' })
  expect(result.stdout.trim()).toMatch(/\/tmp$/)
})

it('reports a non-zero exit code with stderr instead of throwing', async () => {
  const result = await run('/bin/sh', ['-c', 'echo oops >&2; exit 3'])
  expect(result.code).toBe(3)
  expect(result.stderr).toContain('oops')
})

it('reports a spawn failure as code 1 with the message', async () => {
  const result = await run('/definitely/not/a/binary', [])
  expect(result.code).toBe(1)
  expect(result.stderr).not.toBe('')
})

it('runShell wraps a pipeline through sh -c', async () => {
  const result = await runShell('printf a | wc -c')
  expect(result.code).toBe(0)
  expect(result.stdout.trim()).toBe('1')
})

it('hasCommand distinguishes present from missing binaries', async () => {
  await expect(hasCommand('sh')).resolves.toBe(true)
  await expect(hasCommand('definitely-not-a-command-xyz')).resolves.toBe(false)
})
