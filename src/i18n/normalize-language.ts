/** Reduces a BCP-47 tag to a supported base tag, falling back when unrecognised. */
export function normalizeLanguage<T extends string>(
  value: string | null | undefined,
  supported: readonly T[],
  fallback: T,
): T {
  const base = value?.trim().toLowerCase().split('-')[0]
  return supported.includes(base as T) ? (base as T) : fallback
}
