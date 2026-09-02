export type SetSearchParams = (next: URLSearchParams, options?: { replace?: boolean }) => void

/** The smallest binding needed by URL-backed hooks; adapters can come from any router. */
export type SearchParamsBinding = readonly [URLSearchParams, SetSearchParams]

export type Updater<T> = T | ((old: T) => T)

export const applyUpdater = <T>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater
