import { useEffect, useState } from 'react'

import { applyUpdater, type SearchParamsBinding, type Updater } from './search-params'

export type PaginationState = { pageIndex: number; pageSize: number }

export type PaginationOptions = {
  pageIndex?: number
  pageSize?: number
}

export function usePagination(
  binding: SearchParamsBinding,
  { pageIndex = 0, pageSize = 50 }: PaginationOptions = {},
) {
  const [params, setParams] = binding
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex, pageSize })

  // The router's URLSearchParams is copied, never mutated in place.
  const writeParams = (next: PaginationState) => {
    const updated = new URLSearchParams(params)
    updated.set('pageIndex', String(next.pageIndex))
    updated.set('pageSize', String(next.pageSize))
    setParams(updated)
  }

  const updatePagination = (updater: Updater<PaginationState>) => {
    if (typeof updater !== 'function') {
      writeParams(updater)
      setPagination(updater)
      return
    }
    setPagination((previous) => {
      const next = applyUpdater(updater, previous)
      writeParams(next)
      return next
    })
  }

  // Syncs state from the URL, the external source of truth for pagination.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const pageIndexParam = params.get('pageIndex')
    const pageSizeParam = params.get('pageSize')
    setPagination({
      pageIndex: pageIndexParam ? Number(pageIndexParam) : pageIndex,
      pageSize: pageSizeParam ? Number(pageSizeParam) : pageSize,
    })
  }, [params, pageIndex, pageSize])

  return { pagination, updatePagination }
}
