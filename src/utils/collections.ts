export type IdKind = 'number' | 'string'

export function commaSeparatedToArray(value?: string | null): number[]
export function commaSeparatedToArray(
  value: string | null | undefined,
  options: { as: 'number' },
): number[]
export function commaSeparatedToArray(
  value: string | null | undefined,
  options: { as: 'string' },
): string[]
export function commaSeparatedToArray(
  value?: string | null,
  options?: { as: IdKind },
): (number | string)[] {
  const parts =
    value
      ?.split(',')
      .map((f) => f.trim())
      .filter((f) => f) || []
  return options?.as === 'string' ? parts : parts.map(Number)
}

export function arrayToCommaSeparated(
  value?: (string | number | boolean)[] | null,
): string | undefined {
  return value?.join(',') || undefined
}

export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function filterIntersection(
  filter?: string,
  restriction?: (string | number)[],
  apply: boolean = true,
  options?: { as: IdKind },
): string | undefined {
  if (!apply) return filter
  const as = options?.as ?? 'number'
  const filterArray: (string | number)[] =
    as === 'string' ? commaSeparatedToArray(filter, { as }) : commaSeparatedToArray(filter)
  if (!filterArray.length) return arrayToCommaSeparated(restriction)
  if (!restriction) return filter
  if (!restriction.length) return undefined
  const intersection = restriction.filter((asset) =>
    filterArray.includes(as === 'string' ? String(asset) : Number(asset)),
  )
  return arrayToCommaSeparated(intersection)
}

export function removeEmptyAttributes(obj: object): Record<string, unknown> {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .reduce<Record<string, unknown>>((acc, [k, v]) => ({ ...acc, [k]: v }), {})
}

export const DEFAULT_EMAIL_ERROR = 'Please enter a valid email address'

/** Apps pass their translated message, e.g. `t('error_email_valid')`. */
export function emailValidator(
  value: string,
  message: string = DEFAULT_EMAIL_ERROR,
): { result: boolean; message?: string } {
  if (!value) return { result: true }
  const result = /\S+@\S+\.\S+/.test(value)
  return { result, ...(!result && { message }) }
}

export type EnumOption<V> = { label: string; value: V }

export function getEnumOptions(
  obj: Record<string, string | number>,
  getLabel?: (value: number) => string | undefined,
): EnumOption<number>[]
export function getEnumOptions(
  obj: Record<string, string | number>,
  getLabel: ((value: number) => string | undefined) | undefined,
  options: { as: 'string' },
): EnumOption<string>[]
export function getEnumOptions(
  obj: Record<string, string | number>,
  getLabel?: (value: number) => string | undefined,
  options?: { as: IdKind },
): EnumOption<number | string>[] {
  return Object.values(obj)
    .filter((s) => !isNaN(Number(s)))
    .map((s) => Number(s))
    .map((s) => ({
      label: getLabel?.(s) ?? String(s),
      value: options?.as === 'string' ? String(s) : s,
    }))
}
