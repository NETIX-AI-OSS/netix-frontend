import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_TOKEN_ERROR, uploadFile, uploadStaticFile } from './upload'

const OPTIONS = { endpoint: 'https://static.example/api/static/', getToken: () => 'tok' }

const jsonResponse = (status: number) => ({ status, json: vi.fn().mockResolvedValue({ id: 1 }) })

afterEach(() => vi.unstubAllGlobals())

describe('uploadStaticFile', () => {
  it('posts the three-part multipart body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201))
    vi.stubGlobal('fetch', fetchMock)

    await expect(uploadStaticFile('a.png', 'image/png', new Blob(['x']), OPTIONS)).resolves.toEqual(
      { id: 1 },
    )

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(OPTIONS.endpoint)
    expect(init.headers).toEqual({ Authorization: 'Bearer tok' })
    const body = init.body as FormData
    expect(body.get('name')).toBe('a.png')
    expect(body.get('mime')).toBe('image/png')
    expect(body.get('file')).toBeInstanceOf(Blob)
  })

  it('demands a token before touching the network', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      uploadStaticFile('a.png', 'image/png', new Blob(['x']), { ...OPTIONS, getToken: () => null }),
    ).rejects.toThrow(MISSING_TOKEN_ERROR)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws the raw response on any other status', async () => {
    const response = jsonResponse(413)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    await expect(uploadStaticFile('a.png', 'image/png', new Blob(['x']), OPTIONS)).rejects.toBe(
      response,
    )
  })
})

describe('uploadFile', () => {
  const file = (name: string, type: string) => new File(['x'], name, { type })

  it('sanitises commas out of the filename', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200))
    vi.stubGlobal('fetch', fetchMock)

    await uploadFile(file('a,b.png', 'image/png'), OPTIONS)

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((init.body as FormData).get('name')).toBe('a_b.png')
  })

  it('compresses images only when asked and a compressor is supplied', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200)))
    const compressed = new Blob(['small'])
    const compress = vi.fn().mockResolvedValue(compressed)

    await uploadFile(file('a.png', 'image/png'), { ...OPTIONS, compressImages: true, compress })
    expect(compress).toHaveBeenCalledTimes(1)

    await uploadFile(file('a.pdf', 'application/pdf'), {
      ...OPTIONS,
      compressImages: true,
      compress,
    })
    await uploadFile(file('a.png', 'image/png'), { ...OPTIONS, compress })
    await uploadFile(file('a.png', 'image/png'), { ...OPTIONS, compressImages: true })
    expect(compress).toHaveBeenCalledTimes(1)
  })
})
