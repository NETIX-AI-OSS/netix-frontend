import { useSearchParams } from 'react-router'

import type { SearchParamsBinding } from './search-params'
import { type FiltersOptions, useFilters } from './use-filters'
import { type PaginationOptions, usePagination } from './use-pagination'
import { type TabsOptions, useTabs } from './use-tabs'
import { type EpochRange, type TimeRangeOptions, useTimeRange } from './use-time-range'

/** react-router is an optional peer, so this entry is never reachable from the RN-safe ./hooks barrel. */
export function useSearchParamsBinding(): SearchParamsBinding {
  const [params, setParams] = useSearchParams()
  return [params, setParams]
}

export const useRouterPagination = (options?: PaginationOptions) =>
  usePagination(useSearchParamsBinding(), options)

export const useRouterTabs = (options?: TabsOptions) => useTabs(useSearchParamsBinding(), options)

export const useRouterFilters = (options?: FiltersOptions) =>
  useFilters(useSearchParamsBinding(), options)

export const useRouterTimeRange = (defaultRange?: EpochRange, options?: TimeRangeOptions) =>
  useTimeRange(useSearchParamsBinding(), defaultRange, options)
