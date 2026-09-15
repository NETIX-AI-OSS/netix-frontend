import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { basename } from 'node:path'

import { run, type Runner, runShell } from './exec'
import { TEMPLATE_REPO } from './refs'

// .env is tracked template content (the scaffold rewrites its domain), so it is copied
// like any other file; only build output and VCS metadata are skipped.
const COPY_EXCLUDES = new Set(['.git', 'node_modules', 'dist', 'coverage'])

export type AcquireOptions = {
  dest: string
  /** Git ref of the template repo (see `resolveTemplate`); ignored when templatePath is given. */
  ref: string
  /** Local checkout to copy instead of downloading (dev / offline path). */
  templatePath?: string
  runner?: Runner
}

/** gh must exist and be signed in for anything that touches the (private) template repo. */
async function requireGh(runner: Runner): Promise<string | undefined> {
  if ((await runner('/bin/sh', ['-c', 'command -v gh'])).code !== 0)
    return (
      `the GitHub CLI (gh) is required to download ${TEMPLATE_REPO} (a private repo).\n` +
      'Install it and run `gh auth login`, or pass --template-path <local checkout>.'
    )
  if ((await runner('gh', ['auth', 'status'])).code !== 0)
    return 'gh is installed but not authenticated — run `gh auth login` first.'
  return undefined
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

  const missing = await requireGh(runner)
  if (missing) throw new Error(missing)

  const tarball = await runShell(
    `gh api repos/${TEMPLATE_REPO}/tarball/${ref} | tar -xz --strip-components=1 -C '${dest}'`,
    {},
    runner,
  )
  if (tarball.code !== 0)
    throw new Error(`downloading ${TEMPLATE_REPO}@${ref} failed:\n${tarball.stderr}`)
  return { source: `${TEMPLATE_REPO}@${ref}` }
}

/** `v1.2.3` only: release-candidate or moved tags are not template releases. */
const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/

/** The highest `vX.Y.Z` tag among `names` (numeric order, so v1.10.0 beats v1.9.0), if any. */
export function newestReleaseTag(names: string[]): string | undefined {
  const releases = names.flatMap((name) => {
    const match = RELEASE_TAG.exec(name.trim())
    if (!match) return []
    const parts: [number, number, number] = [Number(match[1]), Number(match[2]), Number(match[3])]
    return [{ name: match[0], parts }]
  })
  releases.sort(
    (a, b) => a.parts[0] - b.parts[0] || a.parts[1] - b.parts[1] || a.parts[2] - b.parts[2],
  )
  return releases.at(-1)?.name
}

export type ResolveTemplateOptions = {
  /** `--template-ref`; without it the template's newest `vX.Y.Z` tag is used. */
  ref?: string
  /** Local checkout to copy instead of downloading (dev / offline path). */
  templatePath?: string
  runner?: Runner
}

export type ResolvedTemplate =
  { ref: string; error?: undefined } | { ref?: undefined; error: string }

/**
 * Decides where `netix init` scaffolds from, BEFORE the prompts so a missing gh / bad ref costs
 * one API call instead of six answered questions. Without `--template-ref` the template's newest
 * `vX.Y.Z` tag is resolved here, so a template release needs no library release to be scaffolded
 * from; the tag list doubles as the reachability check. A local path only has to exist.
 */
export async function resolveTemplate({
  ref,
  templatePath,
  runner = run,
}: ResolveTemplateOptions): Promise<ResolvedTemplate> {
  // A local path is copied as-is; acquireTemplate ignores the ref, so any label will do.
  if (templatePath)
    return existsSync(templatePath)
      ? { ref: ref ?? 'local' }
      : { error: `template path not found: ${templatePath}` }

  const missing = await requireGh(runner)
  if (missing) return { error: missing }

  if (ref) {
    const commit = await runner('gh', ['api', `repos/${TEMPLATE_REPO}/commits/${ref}`, '--silent'])
    return commit.code === 0
      ? { ref }
      : {
          error:
            `${TEMPLATE_REPO}@${ref} is not reachable — the ref may not exist yet, or you may not have access.\n` +
            'Pass --template-ref <existing ref> or --template-path <local checkout>.',
        }
  }

  const tags = await runner('gh', [
    'api',
    `repos/${TEMPLATE_REPO}/tags`,
    '--paginate',
    '--jq',
    '.[].name',
  ])
  if (tags.code !== 0)
    return {
      error:
        `listing ${TEMPLATE_REPO} tags failed — you may not have access.\n${tags.stderr}`.trimEnd() +
        '\nPass --template-ref <ref> or --template-path <local checkout>.',
    }
  const newest = newestReleaseTag(tags.stdout.split('\n'))
  return newest
    ? { ref: newest }
    : {
        error:
          `${TEMPLATE_REPO} has no vX.Y.Z tag to scaffold from.\n` +
          'Pass --template-ref <ref> or --template-path <local checkout>.',
      }
}
