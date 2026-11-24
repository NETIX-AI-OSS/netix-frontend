/** Reduces a locale tag to its lowercase base tag, including legacy underscore separators. */
export function baseLanguageTag(value: string | null | undefined): string | undefined {
  return value?.trim().toLowerCase().split(/[-_]/)[0]
}

/** Reduces a locale tag to a supported base tag, falling back when unrecognised. */
export function normalizeLanguage<T extends string>(
  value: string | null | undefined,
  supported: readonly T[],
  fallback: T,
): T {
  const base = baseLanguageTag(value)
  return supported.includes(base as T) ? (base as T) : fallback
}
