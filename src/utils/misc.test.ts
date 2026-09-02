import { afterEach, describe, expect, it, vi } from 'vitest'

import { cn } from './cn'
import { getFileMetadata } from './file-metadata'

afterEach(() => vi.unstubAllGlobals())

describe('cn', () => {
  it('merges conditional classes and resolves tailwind conflicts', () => {
    expect(cn('p-2', { hidden: false }, 'p-4')).toBe('p-4')
  })
})

describe('getFileMetadata', () => {
  const headers = (entries: Record<string, string>) => ({
    get: (key: string) => entries[key] ?? null,
  })

  it('reads type and size from the HEAD response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: headers({ 'Content-Type': 'application/pdf', 'Content-Length': '2048' }),
      }),
    )
    await expect(getFileMetadata('/f.pdf')).resolves.toEqual({
      type: 'application/pdf',
      size: 2048,
    })
  })

  it('leaves missing headers undefined', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, headers: headers({}) }))
    await expect(getFileMetadata('/f.pdf')).resolves.toEqual({
      type: undefined,
      size: undefined,
    })
  })

  it('returns null on a failed probe', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, headers: headers({}) }))
    await expect(getFileMetadata('/f.pdf')).resolves.toBeNull()

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(getFileMetadata('/f.pdf')).resolves.toBeNull()
  })
})
