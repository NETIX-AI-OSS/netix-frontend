import { existsSync, readdirSync } from 'node:fs'
import { basename, resolve } from 'node:path'

import * as p from '@clack/prompts'
import pc from 'picocolors'

import { run, type Runner } from '../exec'
import { LIB_REF, REGISTRY_URL, TEMPLATE_REF } from '../refs'
import { applyScaffoldTransforms } from '../scaffold'
import { loadManifest } from '../services'
import { acquireTemplate, checkTemplateAvailable } from '../template'
import { type ScaffoldOptions, TEMPLATE_DEV_PORT } from '../transforms'
import { schemaPull } from './schema-pull'

export type InitFlags = {
  dir?: string
  name?: string
  title?: string
  baseDomain?: string
  port?: string
  services?: string
  templatePath?: string
  templateRef?: string
  yes?: boolean
  git?: boolean
  install?: boolean
  schemas?: boolean
  generate?: boolean
}

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const DEFAULT_BASE_DOMAIN = 'netixai.dev'
/** The template's own port, so an app that just presses enter matches its Dockerfile. */
const DEFAULT_DEV_PORT = TEMPLATE_DEV_PORT

const bail = (value: unknown): never => {
  p.cancel('init cancelled')
  process.exit(1)
  throw value
}

const isPort = (value: string) =>
  /^\d+$/.test(value.trim()) && Number(value) >= 1 && Number(value) <= 65535

const answer = <T>(value: T | symbol): T => (p.isCancel(value) ? bail(value) : (value as T))

export async function init(flags: InitFlags, runner: Runner = run) {
  const manifest = loadManifest()
  const serviceKeys = Object.keys(manifest.services)

  p.intro(pc.inverse(' netix init '))

  // Fail before the questions, not after them: one API call beats six wasted answers.
  const unreachable = await checkTemplateAvailable({
    ref: flags.templateRef ?? TEMPLATE_REF,
    templatePath: flags.templatePath,
    runner,
  })
  if (unreachable) return fail(unreachable)

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
            placeholder: defaultName,
            defaultValue: defaultName,
            validate: (value) => (!value || KEBAB.test(value) ? undefined : 'use kebab-case'),
          }),
        ))
  if (!KEBAB.test(name)) return fail(`app name must be kebab-case, got "${name}"`)

  const title =
    flags.title ??
    (flags.yes
      ? titleCase(name)
      : answer(
          await p.text({
            message: 'Display title',
            placeholder: titleCase(name),
            defaultValue: titleCase(name),
          }),
        ))

  const baseDomain =
    flags.baseDomain ??
    (flags.yes
      ? DEFAULT_BASE_DOMAIN
      : answer(
          await p.text({
            message: 'Base domain',
            placeholder: DEFAULT_BASE_DOMAIN,
            defaultValue: DEFAULT_BASE_DOMAIN,
          }),
        ))

  const portAnswer =
    flags.port ??
    (flags.yes
      ? String(DEFAULT_DEV_PORT)
      : answer(
          await p.text({
            message: 'Dev server port',
            placeholder: String(DEFAULT_DEV_PORT),
            defaultValue: String(DEFAULT_DEV_PORT),
            validate: (value) => (!value || isPort(value) ? undefined : 'enter a port (1-65535)'),
          }),
        ))
  if (!isPort(portAnswer)) return fail(`dev server port must be 1-65535, got "${portAnswer}"`)
  const devPort = Number(portAnswer)

  // `--services ""` is an explicit "none", so test for the flag's presence rather
  // than its truthiness. Beyond the always-on user service nothing is
  // pre-selected: apps opt into what they call.
  const chosen =
    flags.services !== undefined
      ? flags.services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : flags.yes
        ? []
        : answer(
            await p.multiselect({
              message: 'Which services should this app talk to? (user management is always wired)',
              options: serviceKeys
                .filter((key) => key !== 'user')
                .map((key) => ({
                  value: key,
                  label: manifest.services[key]?.title ?? key,
                  hint: manifest.services[key]?.backendRepo,
                })),
              required: false,
            }),
          )
  const unknown = chosen.filter((key) => !serviceKeys.includes(key))
  if (unknown.length) return fail(`unknown services: ${unknown.join(', ')}`)
  // Every app authenticates and reads users/groups, so the user service is not
  // a choice: it is always wired (client + schema). Its UI is the template's
  // access pages, so it never gets a service-page starter.
  const services = ['user', ...chosen.filter((key) => key !== 'user')]

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

  const options: ScaffoldOptions = {
    name,
    title,
    baseDomain,
    devPort,
    services,
    manifest,
    libRef: LIB_REF,
    registryUrl: REGISTRY_URL,
  }
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

  // Schemas come BEFORE the transforms: a service-page starter derives its columns from the
  // service's OpenAPI spec, and a collection that happens to be empty would otherwise
  // render a table with no headers at all. Pulling first also fails fast — it needs
  // only gh, so a missing login costs seconds rather than a full install.
  await runStep('schema pull', flags.schemas !== false && services.length > 0, async () => {
    const result = await schemaPull({ cwd: dest, manifest, services, runner, log: p.log.info })
    for (const warning of result.warnings) p.log.warn(warning)
    for (const failure of result.failures) p.log.error(failure)
    return result.failures.length === 0
  })

  const notes = applyScaffoldTransforms(dest, options)
  for (const note of notes) p.log.info(note)

  // The commit comes LAST so it captures everything init produced — the pulled
  // schemas and pnpm-lock.yaml included — and a fresh app starts with a clean
  // tree instead of untracked leftovers on top of the scaffold commit.
  const steps: Array<[label: string, enabled: boolean, action: () => Promise<boolean>]> = [
    [
      'pnpm install',
      flags.install !== false,
      async () => (await runner('pnpm', ['install'], { cwd: dest })).code === 0,
    ],
    [
      'pnpm generate:client',
      flags.generate !== false && flags.install !== false && services.length > 0,
      async () => (await runner('pnpm', ['generate:client'], { cwd: dest })).code === 0,
    ],
    [
      'git init + commit',
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
  ]

  for (const [label, enabled, action] of steps) await runStep(label, enabled, action)

  if (skipped.length) p.log.info(`skipped: ${skipped.join(', ')}`)
  if (failed.length) p.log.warn(`finish manually: ${failed.join(', ')}`)

  // Every step that did not run has to be finished before `pnpm dev`, in the order a
  // person would run them: an app without node_modules, without the components its
  // generated pages import, or without generated clients does not boot — and app/client/gen
  // is gitignored, so the clients never arrive with the scaffold. Steps that simply do
  // not apply to this app (no services, no generated page) are not chores; they stay out.
  const pending = (label: string) => skipped.includes(label) || failed.includes(label)
  const resume = [
    ...(pending('pnpm install') ? ['pnpm install'] : []),
    ...(services.length > 0 && pending('schema pull') ? ['npx netix schema pull'] : []),
    // `netix schema pull` ends with generate:client, so name it only on its own.
    ...(services.length > 0 && !pending('schema pull') && pending('pnpm generate:client')
      ? ['pnpm generate:client']
      : []),
  ]

  p.note(
    [
      `cd ${dir}`,
      ...resume,
      'pnpm dev',
      '',
      'Add components:  npx netix add <item>',
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

/** billing-console-ui -> "Billing Console": the -ui/-app suffix is plumbing, not a title. */
const titleCase = (kebab: string) =>
  kebab
    .replace(/-(ui|app|frontend)$/, '')
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
