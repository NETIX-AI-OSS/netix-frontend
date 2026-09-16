/** Filename used when sanitising leaves nothing behind; the multipart part still needs a name. */
export const FALLBACK_UPLOAD_FILENAME = 'upload'

/** Literal `" ' ; = \` plus the percent-escapes CRS decodes back into them via t:urlDecodeUni. */
const WAF_UNSAFE_FILENAME_CHARS = /["';=\\]|%(?:22|27|3b|3d|5c)/gi

/** Rewrites a filename so the edge WAF cannot refuse the upload; see FALLBACK_UPLOAD_FILENAME. */
export function toSafeUploadFilename(name: string | null | undefined): string {
  const sanitized = (name ?? '').replace(WAF_UNSAFE_FILENAME_CHARS, '_').trim()
  return sanitized || FALLBACK_UPLOAD_FILENAME
}
