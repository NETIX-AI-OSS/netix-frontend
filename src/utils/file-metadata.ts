export type FileMetadata = {
  type?: string
  size?: number
}

/** HEAD-probes a static URL; null means the probe failed and the caller should fall back. */
export async function getFileMetadata(url: string): Promise<FileMetadata | null> {
  try {
    const response = await fetch(url, { method: 'HEAD', credentials: 'omit' })
    if (!response.ok) {
      throw new Error('Failed to fetch file information')
    }
    const contentType = response.headers.get('Content-Type')
    const contentLength = response.headers.get('Content-Length')
    return {
      type: contentType || undefined,
      size: contentLength ? parseInt(contentLength, 10) : undefined,
    }
  } catch {
    return null
  }
}
