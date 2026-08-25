import { useEffect, useMemo, useState } from 'react'

import { addDays, getFullDate } from '../utils/date'
import { applyUpdater, type SearchParamsBinding, type Updater } from './search-params'

export type FilterValues = Record<string, unknown>

export type FiltersOptions = {
  /** Namespaces the URL param; anything other than 'filters' also stops the pageIndex reset. */
  filterKey?: string
  /** viz treats created_on__lte as an exclusive bound and shifts it a day; cafm does not. */
  inclusiveEndDate?: boolean
}

const hasValues = (filters?: FilterValues) =>
  !!filters && Object.values(filters).filter((v) => v).length > 0

export function useFilters(binding: SearchParamsBinding, options?: FiltersOptions) {
  const [params, setParams] = binding
  const key = options?.filterKey || 'filters'
  const inclusiveEndDate = options?.inclusiveEndDate ?? false
  const [filters, setFilters] = useState<FilterValues>()
  const [isLoading, setIsLoading] = useState(true)

  const writeParams = (next?: FilterValues) => {
    const updated = new URLSearchParams(params)
    if (hasValues(next)) {
      updated.set(key, JSON.stringify(next))
    } else {
      updated.delete(key)
    }
    if (!options?.filterKey) updated.set('pageIndex', '0')
    setParams(updated)
  }

  const updateFilters = (updater: Updater<FilterValues | undefined>) => {
    if (typeof updater !== 'function') {
      writeParams(updater)
      setFilters(updater)
      return
    }
    setFilters((previous) => {
      const next = applyUpdater(updater, previous)
      writeParams(next)
      return next
    })
  }

  // Syncs state from the URL, the external source of truth for the filters.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsLoading(true)
    const raw = params.get(key)
    if (raw) {
      try {
        setFilters(JSON.parse(raw))
      } catch {
        // A hand-edited URL must not take the list down; keep the previous filters.
      }
    } else {
      setFilters(undefined)
    }
    setIsLoading(false)
  }, [params, key])

  const transformedFilters: FilterValues = useMemo(() => {
    const end = filters?.created_on__lte as string | Date | undefined
    const created_on__lte = end ? getFullDate(inclusiveEndDate ? addDays(end, 1) : end) : undefined
    return { ...filters, created_on__lte }
  }, [filters, inclusiveEndDate])

  return { raw: filters, filters: transformedFilters, updateFilters, isLoading }
}
