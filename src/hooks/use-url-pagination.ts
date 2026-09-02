import { useEffect, useState } from 'react'

import { applyUpdater, type SearchParamsBinding, type Updater } from './search-params'

export type PaginationState = { pageIndex: number; pageSize: number }

export type UrlPaginationOptions = {
  pageIndex?: number
  pageSize?: number
  pageIndexParam?: string
  pageSizeParam?: string
}

const positiveInteger = (value: string | null, fallback: number) => {
  const parsed = value === null ? NaN : Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

/** URL-backed pagination state without a dependency on a specific router. */
export function useUrlPagination(binding: SearchParamsBinding, options: UrlPaginationOptions = {}) {
  const [params, setParams] = binding
  const {
    pageIndex: defaultPageIndex = 0,
    pageSize: defaultPageSize = 10,
    pageIndexParam = 'pageIndex',
    pageSizeParam = 'pageSize',
  } = options
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: defaultPageIndex,
    pageSize: defaultPageSize,
  })

  const writeParams = (next: PaginationState) => {
    const updated = new URLSearchParams(params)
    updated.set(pageIndexParam, String(next.pageIndex))
    updated.set(pageSizeParam, String(next.pageSize))
    setParams(updated)
  }

  const updatePagination = (updater: Updater<PaginationState>) => {
    setPagination((previous) => {
      const next = applyUpdater(updater, previous)
      writeParams(next)
      return next
    })
  }

  /* URLSearchParams is the external source of truth for this state. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPagination({
      pageIndex: positiveInteger(params.get(pageIndexParam), defaultPageIndex),
      pageSize: positiveInteger(params.get(pageSizeParam), defaultPageSize) || defaultPageSize,
    })
  }, [params, pageIndexParam, pageSizeParam, defaultPageIndex, defaultPageSize])

  return { pagination, updatePagination }
}
