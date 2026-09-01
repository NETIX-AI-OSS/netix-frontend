export type SetSearchParams = (next: URLSearchParams, options?: { replace?: boolean }) => void

/** Structurally what react-router's `useSearchParams()` returns, so apps can pass it straight through. */
export type SearchParamsBinding = readonly [URLSearchParams, SetSearchParams]

export type Updater<T> = T | ((old: T) => T)

export const applyUpdater = <T>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater
