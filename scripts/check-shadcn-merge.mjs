import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'

import merge from '@netix/shadcn-merge'

const require = createRequire(import.meta.url)
const shadcnEntry = require.resolve('shadcn')
const shadcnRequire = createRequire(shadcnEntry)
const shadcnPackage = JSON.parse(
  readFileSync(join(dirname(shadcnEntry), '..', 'package.json'), 'utf8'),
)

test('scoped shadcn consumers load the Fastify adapter through CJS and ESM', async () => {
  assert.equal(shadcnRequire('deepmerge'), merge)
  assert.equal(
    (await import(pathToFileURL(shadcnRequire.resolve('deepmerge')).href)).default,
    merge,
  )
  if (shadcnPackage.dependencies['@shadcn/registry']) {
    const registryRequire = createRequire(shadcnRequire.resolve('@shadcn/registry'))
    assert.equal(registryRequire('deepmerge'), merge)
  }
})

test('registry configuration merges clone nested objects, concatenate arrays and retain symbols', () => {
  const symbol = Symbol('config')
  const target = Object.freeze({
    theme: Object.freeze({ left: true }),
    list: Object.freeze([{ a: 1 }]),
    [symbol]: { a: 1 },
  })
  const result = merge(target, { theme: { right: true }, list: [{ b: 2 }], [symbol]: { b: 2 } })
  assert.deepEqual(result.theme, { left: true, right: true })
  assert.deepEqual(result.list, [{ a: 1 }, { b: 2 }])
  assert.notEqual(result.list[0], target.list[0])
  assert.deepEqual(result[symbol], { a: 1, b: 2 })
})

test('shadcn array replacement applies recursively and separately from default concatenation', () => {
  const target = { theme: { fonts: ['old'] }, untouched: true }
  const source = { theme: { fonts: ['new'] } }
  assert.deepEqual(merge(target, source, { arrayMerge: (_target, value) => value }), {
    theme: { fonts: ['new'] },
    untouched: true,
  })
  assert.deepEqual(merge(target, source).theme.fonts, ['old', 'new'])
})

test('registry dependency lists merge through .all including empty and singleton lists', () => {
  assert.deepEqual(merge.all([['react'], ['zod'], []]), ['react', 'zod'])
  assert.deepEqual(merge.all([]), {})
  const single = [{ nested: { flag: true } }]
  const result = merge.all(single)
  assert.deepEqual(result, single[0])
  assert.notEqual(result.nested, single[0].nested)
  assert.throws(() => merge.all({}), /array/)
  assert.throws(() => merge({}, {}, { clone: false }), /arrayMerge/)
})

test('the installed Tailwind updater replaces arrays while preserving other theme settings', async () => {
  const entry = shadcnRequire.resolve('@shadcn/registry/internal/updaters/update-tailwind-config')
  const { transformTailwindConfig } = await import(pathToFileURL(entry).href)
  const result = await transformTailwindConfig(
    'export default { content: [], theme: { extend: { fontFamily: { sans: ["old"] }, spacing: { test: "1px" } } } }',
    { theme: { extend: { fontFamily: { sans: ['new'] } } } },
    { tailwind: { prefix: '' } },
  )
  assert.match(result, /['"]new['"]/)
  assert.doesNotMatch(result, /['"]old['"]/)
  assert.match(result, /test: ['"]1px['"]/)
})

test('Fastify filters prototype keys in source, target and cloned array entries', () => {
  const payload = JSON.parse(
    '{"__proto__":{"admin":true},"constructor":{"prototype":{"admin":true}},"prototype":{"admin":true}}',
  )
  for (const result of [
    merge(Object.create(null), payload),
    merge(payload, {}),
    merge({ nested: null }, { nested: payload }).nested,
    merge({}, { list: [payload] }).list[0],
  ]) {
    assert.equal(Object.getPrototypeOf(result), Object.prototype)
    assert.equal(result.admin, undefined)
    for (const key of ['__proto__', 'constructor', 'prototype'])
      assert.equal(Object.hasOwn(result, key), false)
  }
  assert.equal({}.admin, undefined)
})

test('installed shadcn resolves local registry items and merges their actual dependencies and CSS', async () => {
  const { resolveRegistryItems } = await import(
    pathToFileURL(require.resolve('shadcn/registry')).href
  )
  const temporary = await mkdtemp(join(tmpdir(), 'netix-shadcn-merge-'))
  try {
    const paths = [join(temporary, 'one.json'), join(temporary, 'two.json')]
    for (const [index, path] of paths.entries()) {
      await writeFile(
        path,
        JSON.stringify({
          name: `item-${index}`,
          type: 'registry:ui',
          dependencies: [index ? 'zod' : 'react'],
          devDependencies: [index ? 'typescript' : 'vite'],
          cssVars: { light: { [index ? 'second' : 'first']: `${index}` } },
          files: [],
        }),
      )
    }
    const result = await resolveRegistryItems(paths, {
      config: { resolvedPaths: { cwd: temporary } },
    })
    assert.deepEqual(result.dependencies, ['react', 'zod'])
    assert.deepEqual(result.devDependencies, ['vite', 'typescript'])
    assert.deepEqual(result.cssVars.light, { first: '0', second: '1' })
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
})

test('the lockfile excludes legacy deepmerge and the installed CLI starts', async () => {
  const lockfile = await readFile(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8')
  assert.doesNotMatch(lockfile, /^ {2}deepmerge@/m)
  assert.match(
    execFileSync(process.execPath, [shadcnEntry, '--help'], { encoding: 'utf8' }),
    /build/,
  )
})
