import { existsSync } from 'node:fs'
import { join } from 'node:path'

import * as p from '@clack/prompts'
import pc from 'picocolors'

import { run, type Runner } from '../exec'
import { applyServiceWiring } from '../scaffold'
import { loadManifest } from '../services'
import { pageNames } from '../transforms'
import { detectServices, schemaPull } from './schema-pull'

export type ServiceAddFlags = {
  /** Service keys to wire; prompted for when empty (unless --yes). */
  services: string[]
  yes?: boolean
  schemas?: boolean
  generate?: boolean
  /** App root; defaults to the current directory. */
  cwd?: string
}

const bail = (value: unknown): never => {
  p.cancel('service add cancelled')
  process.exit(1)
  throw value
}

const answer = <T>(value: T | symbol): T => (p.isCancel(value) ? bail(value) : (value as T))

/**
 * `netix service add` — wire backend services into an app that already exists:
 * the same client/orval/env/service-page fan-out `init --services` performs, applied
 * additively, then a schema pull and client generation for the named services.
 * Idempotent, so re-adding a wired service just refreshes its spec and client.
 */
export async function serviceAdd(flags: ServiceAddFlags, runner: Runner = run): Promise<number> {
  const manifest = loadManifest()
  const serviceKeys = Object.keys(manifest.services)
  const cwd = flags.cwd ?? process.cwd()

  p.intro(pc.inverse(' netix service add '))

  if (!existsSync(join(cwd, 'package.json')) || !existsSync(join(cwd, 'orval.config.ts')))
    return fail('no package.json + orval.config.ts here — run this from a netix app root')

  const wired = detectServices(cwd, manifest)
  let services = flags.services
  if (!services.length) {
    if (flags.yes) return fail('name at least one service, e.g. netix service add data,cafm')
    services = answer(
      await p.multiselect({
        message: 'Which services should this app talk to?',
        options: serviceKeys.map((key) => ({
          value: key,
          label: manifest.services[key]?.title ?? key,
          hint: wired.includes(key)
            ? 'already wired — refreshes its schema'
            : manifest.services[key]?.backendRepo,
        })),
        required: true,
      }),
    )
  }
  const unknown = services.filter((key) => !serviceKeys.includes(key))
  if (unknown.length)
    return fail(`unknown services: ${unknown.join(', ')} (known: ${serviceKeys.join(', ')})`)

  const skipped: string[] = []
  const failed: string[] = []
  const runStep = async (label: string, enabled: boolean, action: () => Promise<boolean>) => {
    if (!enabled) {
      skipped.push(label)
      return
    }
    const step = p.spinner()
    step.start(label)
    const ok = await action().catch(() => false)
    step.stop(ok ? label : `${label} ${pc.red('failed')}`)
    if (!ok) failed.push(label)
  }

  // Before the wiring, not after: a service-page starter reads its columns from the service's
  // spec, and a service being added for the first time has no spec on disk yet.
  await runStep('schema pull', flags.schemas !== false, async () => {
    const result = await schemaPull({ cwd, manifest, services, runner, log: p.log.info })
    for (const warning of result.warnings) p.log.warn(warning)
    for (const failure of result.failures) p.log.error(failure)
    return result.failures.length === 0
  })

  try {
    for (const note of applyServiceWiring(cwd, services, manifest)) p.log.info(note)
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error))
  }

  await runStep(
    'pnpm generate:client',
    flags.generate !== false,
    async () => (await runner('pnpm', ['generate:client'], { cwd })).code === 0,
  )

  if (skipped.length) p.log.info(`skipped: ${skipped.join(', ')}`)
  if (failed.length) p.log.warn(`finish manually: ${failed.join(', ')}`)
  p.note(
    [
      'Review the diff, then commit.',
      // The user service gets no page, so there is no endpoint to name.
      ...services
        .filter((key) => key !== 'user')
        .map(
          (key) =>
            `${pageNames(key).file} — lists ${manifest.services[key]?.listEndpoint}; repoint LIST_ENDPOINT for another route`,
        ),
    ].join('\n'),
    'Next steps',
  )
  p.outro(`${pc.green('✔')} ${services.join(', ')} wired`)
  return failed.length ? 1 : 0

  function fail(message: string): number {
    p.log.error(message)
    p.outro(pc.red('service add failed'))
    return 1
  }
}
