import { strict as assert } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const tag = process.argv[2]
assert.equal(tag, `v${manifest.version}`, 'The release tag must match package.json')

const repo = new URL(manifest.repository.url.replace(/^git\+/, '')).pathname
  .slice(1)
  .replace(/\.git$/, '')
const scratch = mkdtempSync(join(tmpdir(), 'netix-release-scaffold-'))
try {
  const dest = join(scratch, 'release-probe')
  execFileSync(
    process.execPath,
    [
      join(root, manifest.bin.netix),
      'init',
      dest,
      '--template-path',
      join(root, 'tests/fixtures/mini-template'),
      '--yes',
      '--no-git',
      '--no-install',
      '--no-schemas',
    ],
    { stdio: 'inherit' },
  )

  const app = JSON.parse(readFileSync(join(dest, 'package.json'), 'utf8'))
  assert.equal(
    app.dependencies[manifest.name],
    `github:${repo}#${tag}`,
    'The built CLI must scaffold the release library pin',
  )

  const components = JSON.parse(readFileSync(join(dest, 'components.json'), 'utf8'))
  const prefix = `https://raw.githubusercontent.com/${repo}/`
  const registryUrl = components.registries?.['@netix']
  assert.ok(
    typeof registryUrl === 'string' && registryUrl.startsWith(prefix),
    'The built CLI must use the canonical registry',
  )
  const registryTag = /^(v\d+\.\d+\.\d+)\/r\/\{name\}\.json$/.exec(
    registryUrl.slice(prefix.length),
  )?.[1]
  assert.ok(registryTag, 'The scaffold registry must be pinned to a version tag')

  if (registryTag !== tag) {
    const differences = execFileSync(
      'git',
      ['diff', '--name-only', `refs/tags/${registryTag}`, '--', 'r'],
      { cwd: root, encoding: 'utf8' },
    ).trim()
    assert.equal(
      differences,
      '',
      `The generated registry changed since ${registryTag}. Set REGISTRY_REF to ${tag} and rebuild.`,
    )
  }
  process.stdout.write(`Verified scaffold library ${tag} and registry ${registryTag}\n`)
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
