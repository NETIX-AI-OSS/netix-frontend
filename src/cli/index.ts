import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

import pc from 'picocolors'

import { addItems } from './commands/add'
import { init } from './commands/init'
import { schemaPull } from './commands/schema-pull'
import { loadManifest } from './services'

const HELP = `${pc.bold('netix')} — scaffold and maintain NETIX frontend apps

Usage:
  netix init [dir] [options]     Create a new app from frontend-template
  netix add <item...>            Copy @netix registry items into this app (shadcn under the hood)
  netix schema pull [service...] Refresh OpenAPI specs from the backend repos (needs gh)

init options:
  --name <kebab>        App + deploy identity (default: directory name)
  --title <text>        Display title
  --base-domain <host>  Deploy domain (default: netixai.dev)
  --services <a,b>      Service keys to wire (see services.json), e.g. data,cafm
  --strip-demo          Remove the demo pages
  --template-path <p>   Scaffold from a local template checkout instead of GitHub
  --template-ref <ref>  Template git ref to download
  --no-git | --no-install | --no-schemas | --no-generate
  --yes                 Accept defaults, no prompts

schema pull options:
  --dry-run             Show what would be fetched

netix add passes extra flags through to shadcn (e.g. --overwrite).
`

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
        services: { type: 'string' },
        'strip-demo': { type: 'boolean' },
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
      services: values.services,
      stripDemo: values['strip-demo'],
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

  if (command === 'schema' && rest[0] === 'pull') {
    const { values, positionals } = parseArgs({
      args: rest.slice(1),
      allowPositionals: true,
      options: { 'dry-run': { type: 'boolean' } },
    })
    const result = await schemaPull({
      cwd: process.cwd(),
      manifest: loadManifest(),
      services: positionals,
      dryRun: values['dry-run'],
      log: (line) => process.stdout.write(`${line}\n`),
    })
    for (const warning of result.warnings) process.stderr.write(`${pc.yellow('warn')} ${warning}\n`)
    for (const failure of result.failures) process.stderr.write(`${pc.red('fail')} ${failure}\n`)
    return result.failures.length ? 1 : 0
  }

  process.stderr.write(`unknown command: ${command}\n\n${HELP}`)
  return 1
}

/* v8 ignore next 2 -- the bin entry; everything it routes to is tested directly */
const invokedAsBin = process.argv[1]?.endsWith('cli/index.js')
if (invokedAsBin) main(process.argv.slice(2)).then((code) => process.exit(code))
