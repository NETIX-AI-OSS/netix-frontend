import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { basename } from 'node:path'

import { run, type Runner, runShell } from './exec'
import { TEMPLATE_REPO } from './refs'

const COPY_EXCLUDES = new Set(['.git', 'node_modules', 'dist', 'coverage'])

export type AcquireOptions = {
  dest: string
  /** Git ref of the template repo; ignored when templatePath is given. */
  ref: string
  /** Local checkout to copy instead of downloading (dev / offline path). */
  templatePath?: string
  runner?: Runner
}

/** Copies or downloads the template into `dest` (created, must not already have files). */
export async function acquireTemplate({ dest, ref, templatePath, runner = run }: AcquireOptions) {
  mkdirSync(dest, { recursive: true })
  if (templatePath) {
    if (!existsSync(templatePath)) throw new Error(`template path not found: ${templatePath}`)
    cpSync(templatePath, dest, {
      recursive: true,
      filter: (source) => !COPY_EXCLUDES.has(basename(source)),
    })
    return { source: templatePath }
  }

  const gh = await runner('/bin/sh', ['-c', 'command -v gh'])
  if (gh.code !== 0)
    throw new Error(
      `the GitHub CLI (gh) is required to download ${TEMPLATE_REPO} (a private repo).\n` +
        'Install it and run `gh auth login`, or pass --template-path <local checkout>.',
    )
  const auth = await runner('gh', ['auth', 'status'])
  if (auth.code !== 0)
    throw new Error('gh is installed but not authenticated — run `gh auth login` first.')

  const tarball = await runShell(
    `gh api repos/${TEMPLATE_REPO}/tarball/${ref} | tar -xz --strip-components=1 -C '${dest}'`,
    {},
    runner,
  )
  if (tarball.code !== 0)
    throw new Error(`downloading ${TEMPLATE_REPO}@${ref} failed:\n${tarball.stderr}`)
  return { source: `${TEMPLATE_REPO}@${ref}` }
}

/**
 * Cheap reachability check for the template source, run BEFORE the prompts so a missing
 * gh / bad ref costs one API call instead of six answered questions.
 */
export async function checkTemplateAvailable({
  ref,
  templatePath,
  runner = run,
}: Omit<AcquireOptions, 'dest'>): Promise<string | undefined> {
  if (templatePath)
    return existsSync(templatePath) ? undefined : `template path not found: ${templatePath}`

  if ((await runner('/bin/sh', ['-c', 'command -v gh'])).code !== 0)
    return (
      `the GitHub CLI (gh) is required to download ${TEMPLATE_REPO} (a private repo).\n` +
      'Install it and run `gh auth login`, or pass --template-path <local checkout>.'
    )
  if ((await runner('gh', ['auth', 'status'])).code !== 0)
    return 'gh is installed but not authenticated — run `gh auth login` first.'
  if ((await runner('gh', ['api', `repos/${TEMPLATE_REPO}/commits/${ref}`, '--silent'])).code !== 0)
    return (
      `${TEMPLATE_REPO}@${ref} is not reachable — the ref may not exist yet, or you may not have access.\n` +
      'Pass --template-ref <existing ref> or --template-path <local checkout>.'
    )
  return undefined
}
