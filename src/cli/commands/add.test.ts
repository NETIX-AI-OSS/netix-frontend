// @vitest-environment node
import { EventEmitter } from 'node:events'

import { addItems, qualifyItems } from './add'

const spawnMock = vi.hoisted(() => vi.fn())
vi.mock('node:child_process', () => ({ default: { spawn: spawnMock }, spawn: spawnMock }))

it('namespaces bare items into @netix and leaves qualified ones alone', () => {
  expect(
    qualifyItems(['use-tabs', '@netix/data-table', 'https://x/r/y.json', 'file:../r/z.json']),
  ).toEqual(['@netix/use-tabs', '@netix/data-table', 'https://x/r/y.json', 'file:../r/z.json'])
})

it('delegates to the pinned shadcn CLI and resolves with its exit code', async () => {
  const child = new EventEmitter()
  spawnMock.mockReturnValue(child)
  const pending = addItems(['use-tabs'], ['--overwrite'])
  child.emit('close', 0)
  await expect(pending).resolves.toBe(0)
  expect(spawnMock).toHaveBeenCalledWith(
    'pnpm',
    ['dlx', 'shadcn@4.19.1', 'add', '@netix/use-tabs', '--overwrite'],
    { stdio: 'inherit' },
  )
})

it('resolves 1 when the spawn itself fails', async () => {
  const child = new EventEmitter()
  spawnMock.mockReturnValue(child)
  const pending = addItems(['x'])
  child.emit('error', new Error('missing pnpm'))
  await expect(pending).resolves.toBe(1)
})
