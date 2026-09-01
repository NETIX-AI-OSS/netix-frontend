import { existsSync, readdirSync } from 'node:fs'
import { basename, resolve } from 'node:path'

import * as p from '@clack/prompts'
import pc from 'picocolors'

import { run, type Runner } from '../exec'
import { LIB_REF, REGISTRY_URL, TEMPLATE_REF } from '../refs'
import { applyScaffoldTransforms } from '../scaffold'
import { loadManifest } from '../services'
import { acquireTemplate } from '../template'
import type { ScaffoldOptions } from '../transforms'
import { schemaPull } from './schema-pull'

export type InitFlags = {
  dir?: string
  name?: string
  title?: string
  baseDomain?: string
  services?: string
  stripDemo?: boolean
  templatePath?: string
  templateRef?: string
  yes?: boolean
  git?: boolean
  install?: boolean
  schemas?: boolean
  generate?: boolean
}

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

const bail = (value: unknown): never => {
  p.cancel('init cancelled')
  process.exit(1)
  throw value
}

const answer = <T>(value: T | symbol): T => (p.isCancel(value) ? bail(value) : (value as T))

export async function init(flags: InitFlags, runner: Runner = run) {
  const manifest = loadManifest()
  const serviceKeys = Object.keys(manifest.services)

  p.intro(pc.inverse(' netix init '))

  const dir =
    flags.dir ??
    (flags.yes
      ? undefined
      : answer(
          await p.text({
            message: 'Where should the app be created?',
            placeholder: './my-app-ui',
            validate: (value) => (value?.trim() ? undefined : 'enter a directory'),
          }),
        ))
  if (!dir) return fail('a target directory is required (pass one or drop --yes)')
  const dest = resolve(dir)
  if (existsSync(dest) && readdirSync(dest).length > 0)
    return fail(`${dest} already exists and is not empty`)

  const defaultName = basename(dest).toLowerCase()
  const name =
    flags.name ??
    (flags.yes
      ? defaultName
      : answer(
          await p.text({
            message: 'App name (kebab-case; also the deploy identity)',
            initialValue: defaultName,
            validate: (value) => (KEBAB.test(value ?? '') ? undefined : 'use kebab-case'),
          }),
        ))
  if (!KEBAB.test(name)) return fail(`app name must be kebab-case, got "${name}"`)

  const title =
    flags.title ??
    (flags.yes
      ? titleCase(name)
      : answer(await p.text({ message: 'Display title', initialValue: titleCase(name) })))

  const baseDomain =
    flags.baseDomain ??
    (flags.yes
      ? 'netixai.dev'
      : answer(await p.text({ message: 'Base domain', initialValue: 'netixai.dev' })))

  const services = flags.services
    ? flags.services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : flags.yes
      ? ['data']
      : answer(
          await p.multiselect({
            message: 'Which services should this app talk to?',
            options: serviceKeys.map((key) => ({
              value: key,
              label: manifest.services[key]?.title ?? key,
              hint: manifest.services[key]?.backendRepo,
            })),
            initialValues: ['data'],
            required: false,
          }),
        )
  const unknown = services.filter((key) => !serviceKeys.includes(key))
  if (unknown.length) return fail(`unknown services: ${unknown.join(', ')}`)

  const stripDemo =
    flags.stripDemo ??
    (flags.yes
      ? false
      : answer(await p.confirm({ message: 'Strip the demo pages?', initialValue: false })))

  const spinner = p.spinner()
  spinner.start(
    `Fetching template (${flags.templatePath ?? `${flags.templateRef ?? TEMPLATE_REF}`})`,
  )
  try {
    const { source } = await acquireTemplate({
      dest,
      ref: flags.templateRef ?? TEMPLATE_REF,
      templatePath: flags.templatePath,
      runner,
    })
    spinner.stop(`Template ready (${source})`)
  } catch (error) {
    spinner.stop('Template fetch failed')
    return fail(error instanceof Error ? error.message : String(error))
  }

  const options: ScaffoldOptions & { stripDemo: boolean } = {
    name,
    title,
    baseDomain,
    services,
    manifest,
    libRef: LIB_REF,
    registryUrl: REGISTRY_URL,
    stripDemo,
  }
  const notes = applyScaffoldTransforms(dest, options)
  for (const note of notes) p.log.info(note)

  const steps: Array<[label: string, enabled: boolean, action: () => Promise<boolean>]> = [
    [
      'git init',
      flags.git !== false,
      async () =>
        (await runner('git', ['init', '-q'], { cwd: dest })).code === 0 &&
        (await runner('git', ['add', '-A'], { cwd: dest })).code === 0 &&
        (
          await runner('git', ['commit', '-q', '-m', `chore: scaffold ${name} with netix init`], {
            cwd: dest,
          })
        ).code === 0,
    ],
    [
      'pnpm install',
      flags.install !== false,
      async () => (await runner('pnpm', ['install'], { cwd: dest })).code === 0,
    ],
    [
      'schema pull',
      flags.schemas !== false && services.length > 0,
      async () => {
        const result = await schemaPull({ cwd: dest, manifest, services, runner, log: p.log.info })
        for (const warning of result.warnings) p.log.warn(warning)
        for (const failure of result.failures) p.log.error(failure)
        return result.failures.length === 0
      },
    ],
    [
      'pnpm generate:client',
      flags.generate !== false && flags.install !== false && services.length > 0,
      async () => (await runner('pnpm', ['generate:client'], { cwd: dest })).code === 0,
    ],
  ]

  const skipped: string[] = []
  const failed: string[] = []
  for (const [label, enabled, action] of steps) {
    if (!enabled) {
      skipped.push(label)
      continue
    }
    const step = p.spinner()
    step.start(label)
    const ok = await action().catch(() => false)
    step.stop(ok ? label : `${label} ${pc.red('failed')}`)
    if (!ok) failed.push(label)
  }

  if (skipped.length) p.log.info(`skipped: ${skipped.join(', ')}`)
  if (failed.length) p.log.warn(`finish manually: ${failed.join(', ')}`)
  p.note(
    [
      `cd ${dir}`,
      ...(failed.includes('pnpm install') || flags.install === false ? ['pnpm install'] : []),
      'pnpm dev',
      '',
      'Add components:  npx netix add data-table',
      'Refresh schemas: npx netix schema pull',
    ].join('\n'),
    'Next steps',
  )
  p.outro(`${pc.green('✔')} ${name} is ready`)
  return 0

  function fail(message: string): number {
    p.log.error(message)
    p.outro(pc.red('init failed'))
    return 1
  }
}

const titleCase = (kebab: string) =>
  kebab
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
