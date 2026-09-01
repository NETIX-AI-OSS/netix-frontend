import type { FieldValues } from 'react-hook-form'

import type { Updater } from '@/hooks/search-params'
import type { FilterValues } from '@/hooks/use-filters'

export type FilterOption = { label: string; value: string }

// Orval list hooks are generated per app and differ in their option key (react-query vs swr).
export type UseListHook = (
  params: Record<string, unknown>,
  options: Record<string, { enabled: boolean }>,
) => { data?: unknown; isLoading?: boolean }

export type UseOptionsHook = (data: unknown) => FilterOption[]

export type ColumnFilterMeta = {
  key: string
  useList?: UseListHook
  useOptions?: UseOptionsHook
  options?: FilterOption[]
  multiple?: boolean
  transformer?: (f?: FieldValues) => Promise<FieldValues | undefined>
  sort?: string
}

export type ColumnMeta = {
  filter?: ColumnFilterMeta
  headerClassName?: string
  cellClassName?: string
}

export type ColumnFilterLabels = {
  search: string
  reset: string
  noDataFound: string
}

export const DEFAULT_COLUMN_FILTER_LABELS: ColumnFilterLabels = {
  search: 'Search',
  reset: 'Reset',
  noDataFound: 'No data found',
}

export const DEBOUNCE_DELAY_MS = 800

// Everything the router-coupled donors read from useFilters()/useUser(), injected instead.
// Shaped so a useFilters() result can be spread straight in.
export type FilterContext = {
  filters?: FilterValues
  updateFilters: (updater: Updater<FilterValues | undefined>) => void
  listParams?: Record<string, unknown>
  queryOptionKey?: string
  debounceMs?: number
  labels?: Partial<ColumnFilterLabels>
  translateOptionLabel?: (label: string) => string
  onError?: (error: unknown) => void
}
