import { readFileSync, realpathSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

import pc from 'picocolors'

import { addItems } from './commands/add'
import { init } from './commands/init'
import { schemaPull } from './commands/schema-pull'
import { serviceAdd } from './commands/service-add'
import { loadManifest } from './services'

const HELP = `${pc.bold('netix')} — scaffold and maintain NETIX frontend apps

Usage:
  netix init [dir] [options]       Create a new app from frontend-template
  netix add <item...>              Copy @netix registry items into this app (shadcn under the hood)
  netix service add [service...]   Wire backend services into this app (client + env + module), then pull + generate
  netix schema pull [service...]   Refresh OpenAPI specs (all wired services when none named) and regenerate clients

Service names are comma- or space-separated (data,cafm or data cafm — see services.json).

init options:
  --name <kebab>        App + deploy identity (default: directory name)
  --title <text>        Display title
  --base-domain <host>  Deploy domain (default: netixai.dev)
  --port <number>       Dev server port (default: 5174)
  --services <a,b>      Extra services to wire (see services.json), e.g. data,cafm
                        The user service is always wired — every app authenticates.
  --template-path <p>   Scaffold from a local template checkout instead of GitHub
  --template-ref <ref>  Template git ref to download
  --no-git | --no-install | --no-schemas | --no-generate
  --yes                 Accept defaults, no prompts

service add options:
  --no-schemas          Skip the schema pull
  --no-generate         Skip pnpm generate:client
  --yes                 No prompts (services must then be named)

schema pull options:
  --dry-run             Show what would be fetched
  --no-generate         Skip pnpm generate:client after pulling

netix add passes extra flags through to shadcn (e.g. --overwrite).
`

/** "data,cafm asset" → ["data", "cafm", "asset"]: commas and spaces both separate, duplicates drop. */
const splitServices = (args: string[]): string[] => [
  ...new Set(
    args
      .flatMap((arg) => arg.split(','))
      .map((key) => key.trim())
      .filter(Boolean),
  ),
]

const version = () =>
  (
    JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
      version: string
    }
  ).version

export async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv
  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(HELP)
    return 0
  }
  if (command === '--version' || command === '-v') {
    process.stdout.write(`${version()}\n`)
    return 0
  }

  if (command === 'init') {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: {
        name: { type: 'string' },
        title: { type: 'string' },
        'base-domain': { type: 'string' },
        port: { type: 'string' },
        services: { type: 'string' },
        'template-path': { type: 'string' },
        'template-ref': { type: 'string' },
        yes: { type: 'boolean' },
        'no-git': { type: 'boolean' },
        'no-install': { type: 'boolean' },
        'no-schemas': { type: 'boolean' },
        'no-generate': { type: 'boolean' },
      },
    })
    return init({
      dir: positionals[0],
      name: values.name,
      title: values.title,
      baseDomain: values['base-domain'],
      port: values.port,
      services: values.services,
      templatePath: values['template-path'],
      templateRef: values['template-ref'],
      yes: values.yes,
      git: !values['no-git'],
      install: !values['no-install'],
      schemas: !values['no-schemas'],
      generate: !values['no-generate'],
    })
  }

  if (command === 'add') {
    if (!rest.length) {
      process.stderr.write('netix add: name at least one registry item\n')
      return 1
    }
    const items = rest.filter((arg) => !arg.startsWith('-'))
    const passthrough = rest.filter((arg) => arg.startsWith('-'))
    return addItems(items, passthrough)
  }

  if (command === 'service' && rest[0] === 'add') {
    const { values, positionals } = parseArgs({
      args: rest.slice(1),
      allowPositionals: true,
      options: {
        yes: { type: 'boolean' },
        'no-schemas': { type: 'boolean' },
        'no-generate': { type: 'boolean' },
      },
    })
    return serviceAdd({
      services: splitServices(positionals),
      yes: values.yes,
      schemas: !values['no-schemas'],
      generate: !values['no-generate'],
    })
  }

  if (command === 'schema' && rest[0] === 'pull') {
    const { values, positionals } = parseArgs({
      args: rest.slice(1),
      allowPositionals: true,
      options: { 'dry-run': { type: 'boolean' }, 'no-generate': { type: 'boolean' } },
    })
    const result = await schemaPull({
      cwd: process.cwd(),
      manifest: loadManifest(),
      services: splitServices(positionals),
      dryRun: values['dry-run'],
      generate: !values['no-generate'],
      log: (line) => process.stdout.write(`${line}\n`),
    })
    for (const warning of result.warnings) process.stderr.write(`${pc.yellow('warn')} ${warning}\n`)
    for (const failure of result.failures) process.stderr.write(`${pc.red('fail')} ${failure}\n`)
    return result.failures.length ? 1 : 0
  }

  process.stderr.write(`unknown command: ${command}\n\n${HELP}`)
  return 1
}

/**
 * True when this module is the process entry point. `process.argv[1]` is the path
 * as invoked, which for an installed package is the `node_modules/.bin/netix`
 * symlink — so resolve it before comparing, or the bin silently does nothing.
 */
export function isEntryPoint(entry: string | undefined, moduleUrl: string): boolean {
  if (!entry) return false
  try {
    return pathToFileURL(realpathSync(entry)).href === moduleUrl
  } catch {
    return false
  }
}

/* v8 ignore next 2 -- the bin entry; isEntryPoint and everything it routes to are tested */
if (isEntryPoint(process.argv[1], import.meta.url))
  main(process.argv.slice(2)).then((code) => process.exit(code))
