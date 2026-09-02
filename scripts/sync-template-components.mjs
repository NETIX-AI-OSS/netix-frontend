#!/usr/bin/env node
/**
 * Copies the registry items a scaffolded app cannot boot without into a
 * frontend-template checkout, so `netix init` ships them instead of fetching them.
 *
 * Direction of truth: registry UI is authored and tested HERE; the release template
 * carries verbatim copies. Applications created from that template permanently own
 * their copies and are never changed by this script.
 *
 *   node scripts/sync-template-components.mjs ../frontend-template
 *   node scripts/sync-template-components.mjs ../frontend-template --check
 *
 * `--check` exits non-zero on drift and writes nothing, for CI and for the release
 * checklist: sync + tag the template BEFORE bumping src/cli/refs.ts.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Matches gen-tokens.mjs: the repo bans console in favour of the raw streams.
const stdout = (message) => process.stdout.write(`${message}\n`)
const stderr = (message) => process.stderr.write(`${message}\n`)

/** Registry UI a fresh template must contain without a network request. */
const ROOTS = [
  'badge',
  'button',
  'dialog',
  'field',
  'input',
  'label',
  'popover',
  'select',
  'separator',
  'skeleton',
  'table',
  'data-table',
]

const DEST_DIR = {
  'registry:ui': 'app/components/ui',
  'registry:component': 'app/components',
}

const args = process.argv.slice(2)
const check = args.includes('--check')
const templateArg = args.find((arg) => !arg.startsWith('--'))
if (!templateArg) {
  stderr('usage: sync-template-components.mjs <frontend-template path> [--check]')
  process.exit(2)
}
const template = resolve(templateArg)
if (!existsSync(join(template, 'components.json'))) {
  stderr(`not a frontend-template checkout: ${template}`)
  process.exit(2)
}

const registry = JSON.parse(readFileSync(join(HERE, 'registry.json'), 'utf8'))
const items = new Map(registry.items.map((item) => [item.name, item]))

/** Depth-first over registryDependencies, @netix only — the rest the template already owns. */
const closure = new Map()
const walk = (name) => {
  if (closure.has(name)) return
  const item = items.get(name)
  if (!item) return
  closure.set(name, item)
  for (const dep of item.registryDependencies ?? [])
    if (dep.startsWith('@netix/')) walk(dep.slice('@netix/'.length))
}
for (const root of ROOTS) walk(root)

const drifted = []
const written = []
for (const item of closure.values()) {
  const dir = DEST_DIR[item.type]
  if (!dir) continue
  for (const file of item.files) {
    const source = readFileSync(join(HERE, file.path), 'utf8')
    const relativeTarget = file.target?.replace(/^@\/components(?=\/|$)/, 'app/components')
    const relativeDest = relativeTarget ?? join(dir, basename(file.path))
    const dest = join(template, relativeDest)
    const current = existsSync(dest) ? readFileSync(dest, 'utf8') : null
    if (current === source) continue
    if (check) {
      drifted.push(`${relativeDest} ${current === null ? '(missing)' : '(differs)'}`)
      continue
    }
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, source)
    written.push(relativeDest)
  }
}

if (check) {
  if (drifted.length) {
    stderr(`template copies are out of date:\n  ${drifted.join('\n  ')}`)
    stderr('\nrun: node scripts/sync-template-components.mjs <template>')
    process.exit(1)
  }
  stdout(`template copies match (${closure.size} items)`)
} else {
  stdout(
    written.length
      ? `synced:\n  ${written.join('\n  ')}`
      : `already up to date (${closure.size} items)`,
  )
}
