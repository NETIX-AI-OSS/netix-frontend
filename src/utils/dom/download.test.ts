import { afterEach, describe, expect, it, vi } from 'vitest'

import { downloadFile, saveFile } from './download'

const okResponse = () => ({ ok: true, blob: vi.fn().mockResolvedValue(new Blob(['x'])) })

const failResponse = (status: number, statusText = '') => ({ ok: false, status, statusText })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const stubObjectUrl = () => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn().mockReturnValue('blob:x'),
    revokeObjectURL: vi.fn(),
  })
}

describe('saveFile', () => {
  it('clicks a detached anchor and cleans it up', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    saveFile('blob:x', 'report.csv')
    expect(click).toHaveBeenCalled()
    expect(document.querySelector('a')).toBeNull()
  })

  it('falls back to a default filename', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const appendChild = vi.spyOn(document.body, 'appendChild')
    saveFile('blob:x', '')
    expect((appendChild.mock.calls[0]?.[0] as HTMLAnchorElement).download).toBe('file-name')
  })
})

describe('downloadFile', () => {
  it('sends the bearer token and saves the blob', async () => {
    stubObjectUrl()
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await downloadFile('/api/report', 'text/csv', 'r.csv', { getToken: () => 'tok' })

    expect(fetchMock).toHaveBeenCalledWith('/api/report', {
      headers: { Accept: 'text/csv', Authorization: 'Bearer tok' },
    })
  })

  it('sends an empty authorization header when no token resolver is given', async () => {
    stubObjectUrl()
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await downloadFile('/api/report', 'text/csv', 'r.csv')

    expect(fetchMock.mock.calls[0]?.[1].headers.Authorization).toBe('')
  })

  it('throws a described error and reports unhandled statuses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failResponse(500, 'Server Error')))
    const captureException = vi.fn()

    await expect(
      downloadFile('/api/report', 'text/csv', 'r.csv', { captureException }),
    ).rejects.toMatchObject({
      message: 'Download failed: 500 Server Error',
      status: 500,
      url: '/api/report',
      filename: 'r.csv',
    })
    expect(captureException).toHaveBeenCalledTimes(1)
  })

  it('stays silent for statuses the apps handle in-app', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failResponse(403, 'Forbidden')))
    const captureException = vi.fn()

    await expect(
      downloadFile('/api/report', 'text/csv', 'r.csv', { captureException }),
    ).rejects.toThrow('Download failed: 403 Forbidden')
    expect(captureException).not.toHaveBeenCalled()
  })

  it('omits the detail suffix for an opaque response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failResponse(0)))
    await expect(downloadFile('/api/report', 'text/csv', 'r.csv')).rejects.toThrow(
      'Download failed',
    )
  })

  it('always reports proxy statuses, even under a permissive shouldCapture', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failResponse(502)))
    const captureException = vi.fn()

    await expect(
      downloadFile('/api/report', 'text/csv', 'r.csv', {
        captureException,
        shouldCapture: () => false,
      }),
    ).rejects.toThrow('Download failed: 502')
    expect(captureException).toHaveBeenCalledTimes(1)
  })
})
