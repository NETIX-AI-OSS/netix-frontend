export const MISSING_TOKEN_ERROR =
  'Unable to retrieve authentication token. Please sign in and try again.'

export type UploadOptions = {
  endpoint: string
  getToken: () => string | null | undefined | Promise<string | null | undefined>
  /** Image downscaler; stays app-side because react-image-file-resizer is not a package dep. */
  compress?: (file: File) => Promise<Blob>
}

export async function uploadStaticFile(
  name: string,
  mime: string,
  file: Blob,
  options: UploadOptions,
): Promise<unknown> {
  const token = await options.getToken()
  if (!token) {
    throw new Error(MISSING_TOKEN_ERROR)
  }
  const formData = new FormData()
  formData.append('name', name)
  formData.append('mime', mime)
  formData.append('file', file)
  const response = await fetch(options.endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!(response.status === 200 || response.status === 201)) throw response
  return await response.json()
}

export async function uploadFile(
  file: File,
  options: UploadOptions & { compressImages?: boolean },
): Promise<unknown> {
  const shouldCompress =
    options.compressImages && typeof file.type === 'string' && file.type.startsWith('image/')
  const body = shouldCompress && options.compress ? await options.compress(file) : file
  return uploadStaticFile(file.name?.replace(/,/g, '_'), file.type, body, options)
}
