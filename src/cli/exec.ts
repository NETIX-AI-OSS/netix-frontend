import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export type ExecResult = { code: number; stdout: string; stderr: string }

/** Injected everywhere a command shells out, so tests never touch the network or git. */
export type Runner = (
  command: string,
  args: string[],
  options?: { cwd?: string },
) => Promise<ExecResult>

export const run: Runner = async (command, args, options = {}) => {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd: options.cwd,
      maxBuffer: 64 * 1024 * 1024,
    })
    return { code: 0, stdout, stderr }
  } catch (error) {
    const failure = error as { code?: number; stdout?: string; stderr?: string; message?: string }
    return {
      code: typeof failure.code === 'number' ? failure.code : 1,
      stdout: failure.stdout ?? '',
      // A spawn failure (ENOENT etc.) carries empty stdio strings; the message is the signal.
      stderr: failure.stderr || failure.message || '',
    }
  }
}

/** `sh -c` variant for the one pipeline we need (gh tarball | tar). */
export const runShell = (script: string, options: { cwd?: string } = {}, runner: Runner = run) =>
  runner('/bin/sh', ['-c', script], options)

export const hasCommand = async (command: string, runner: Runner = run) =>
  (await runner('/bin/sh', ['-c', `command -v ${command}`])).code === 0
