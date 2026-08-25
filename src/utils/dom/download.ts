/** Proxy-level failures the application never sees, so nothing reports them server-side. */
const PROXY_STATUSES = new Set([502, 504])

/** Statuses the apps surface in-app; the shared Sentry policy drops them. */
const HANDLED_STATUSES = new Set([400, 403, 404])

export type DownloadFileOptions = {
  getToken?: () => string | null | undefined | Promise<string | null | undefined>
  captureException?: (error: unknown) => void
  shouldCapture?: (status: number) => boolean
}

export type DownloadError = Error & { status: number; url: string; filename: string }

export function saveFile(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'file-name'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export async function downloadFile(
  url: string,
  acceptHeader: string,
  filename: string,
  options?: DownloadFileOptions,
) {
  const token = await options?.getToken?.()
  const response = await fetch(url, {
    headers: {
      Accept: acceptHeader,
      Authorization: token ? `Bearer ${token}` : '',
    },
  })
  if (!response.ok) {
    const { status, statusText } = response
    const detail = [status, statusText].filter(Boolean).join(' ')
    const error = Object.assign(new Error(`Download failed${detail ? `: ${detail}` : ''}`), {
      status,
      url,
      filename,
    })
    const shouldCapture = options?.shouldCapture ?? ((s: number) => !HANDLED_STATUSES.has(s))
    if (shouldCapture(status) || PROXY_STATUSES.has(status)) {
      options?.captureException?.(error)
    }
    throw error
  }
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  saveFile(blobUrl, filename)
  URL.revokeObjectURL(blobUrl)
}
