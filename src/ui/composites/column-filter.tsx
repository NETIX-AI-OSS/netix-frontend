import type { RowData } from '@tanstack/react-table'
import type { LegacyColumn as Column } from '@tanstack/react-table/legacy'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FieldValues } from 'react-hook-form'

import { cn } from '../../utils/cn'
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '../primitives'
import type {
  ColumnFilterLabels,
  ColumnMeta,
  FilterContext,
  FilterOption,
  UseListHook,
  UseOptionsHook,
} from './data-table-types'
import { DEBOUNCE_DELAY_MS, DEFAULT_COLUMN_FILTER_LABELS } from './data-table-types'
import { LoadingState } from './loading-state'
import { OptionList } from './option-list'

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export type ColumnFilterProps = {
  column: Column<RowData, unknown>
  filtering: FilterContext
}

export function ColumnFilter({ column, filtering }: ColumnFilterProps) {
  const { filters, updateFilters, onError } = filtering
  const labels: ColumnFilterLabels = { ...DEFAULT_COLUMN_FILTER_LABELS, ...filtering.labels }
  const [value, setValue] = useState('')
  const [optionValue, setOptionValue] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const meta = column.columnDef.meta as ColumnMeta | undefined
  const { key, transformer, useList, useOptions, options, multiple, sort } = meta?.filter ?? {}
  const filterValue = key ? (filters?.[key] as string | undefined) : undefined
  const ordering = filters?.ordering as string | undefined
  const isOptionsFilter = !!options || !!useList

  useEffect(() => {
    // The inputs mirror whatever the filter store currently holds.
    const v = filterValue || ''
    /* eslint-disable react-hooks/set-state-in-effect */
    setValue(v)
    setOptionValue(v.split(',').filter((o: string) => o))
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [filterValue])

  async function transformedFilter(f?: FieldValues) {
    return transformer ? await transformer(f) : f
  }

  useEffect(() => {
    if (sort && ordering) {
      const isAsc = ordering === sort
      const isDesc = ordering === `-${sort}`
      if (isAsc || isDesc) {
        column.toggleSorting(!isAsc, false)
      }
    }
  }, [ordering, sort, column])

  // finally clears the busy flag even when the caller's transformer rejects; without it both
  // buttons stay disabled until unmount (the confirmed viz/cafm bug).
  async function handleUpdate() {
    if (!key) return
    setIsLoading(true)
    try {
      const f = await transformedFilter({ [key]: isOptionsFilter ? optionValue.join(',') : value })
      updateFilters((prev) => ({ ...prev, ...f }))
      setOpen(false)
    } catch (error) {
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleReset() {
    if (!key) return
    setIsLoading(true)
    try {
      const f = await transformedFilter({ [key]: undefined })
      setValue('')
      setOptionValue([])
      // k !== key drops the filter even when the transformer returns {} or undefined.
      updateFilters((prev) =>
        Object.fromEntries(
          Object.entries(prev || {}).filter(
            ([k]) => k !== key && !Object.keys(f || {}).includes(k),
          ),
        ),
      )
      setOpen(false)
    } catch (error) {
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSort(isAsc: boolean) {
    if (!sort) return
    setIsLoading(true)
    try {
      const f = await transformedFilter({ ordering: isAsc ? sort : `-${sort}` })
      updateFilters((prev) => ({ ...prev, ...f }))
    } catch (error) {
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-end gap-1">
        <PopoverTrigger>
          {!!key && (
            <SearchIcon
              className={cn('size-4 text-foreground hover:text-primary', value && 'text-primary')}
            />
          )}
        </PopoverTrigger>
        {!!sort && (
          <div
            data-testid="column-filter-sort"
            onClick={(e) => {
              e.preventDefault()
              const isAsc = column.getIsSorted() !== 'asc'
              column.toggleSorting(!isAsc)
              handleSort(isAsc)
            }}
          >
            {column.getIsSorted() === 'asc' ? (
              <ArrowUpNarrowWide className="size-4 cursor-pointer text-foreground hover:text-primary" />
            ) : (
              <ArrowDownWideNarrow className="size-4 cursor-pointer text-foreground hover:text-primary" />
            )}
          </div>
        )}
      </div>
      <PopoverContent align="end" className="mt-2 w-56 rounded-xl px-0 py-3 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleUpdate()
          }}
        >
          {!!options && (
            <OptionsInput
              value={optionValue}
              onValueChange={setOptionValue}
              options={options}
              multiple={multiple}
              labels={labels}
              translateOptionLabel={filtering.translateOptionLabel}
            />
          )}
          {!!useList && !!useOptions && (
            <SearchableOptionsInput
              value={optionValue}
              onValueChange={setOptionValue}
              useList={useList}
              useOptions={useOptions}
              multiple={multiple}
              labels={labels}
              filtering={filtering}
            />
          )}
          {!isOptionsFilter && (
            <div className="mt-2 px-3">
              <Input
                placeholder={labels.search}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
          )}
        </form>
        <div className="mx-3 mt-3 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={handleReset} disabled={isLoading}>
            {labels.reset}
          </Button>
          <Button className="flex-1" onClick={handleUpdate} disabled={isLoading}>
            {isLoading && <LoadingState variant="button" className="me-2 size-4" />}
            {labels.search}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type OptionsProps = {
  options: FilterOption[]
  onValueChange: (value: string[]) => void
  value: string[]
  searchValue?: string
  onSearchValueChange?: (value: string) => void
  multiple?: boolean
  loading?: boolean
  labels: ColumnFilterLabels
  translateOptionLabel?: (label: string) => string
}

function OptionsInput({
  options,
  value,
  searchValue,
  onValueChange,
  onSearchValueChange,
  loading,
  multiple,
  labels,
  translateOptionLabel,
}: OptionsProps) {
  return (
    <OptionList
      placeholder={labels.search}
      searchValue={searchValue}
      onSearchValueChange={onSearchValueChange}
      empty={
        loading ? (
          <div className="flex justify-center">
            <LoadingState variant="button" />
          </div>
        ) : (
          labels.noDataFound
        )
      }
      items={options.map((option) => {
        const selected = value.includes(option.value)
        return {
          key: option.value,
          text: option.value,
          selected,
          onSelect: () =>
            selected
              ? onValueChange(value.filter((v) => v !== option.value))
              : onValueChange([...(multiple ? value : []), option.value]),
          content: (
            <>
              <Check className={cn('me-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')} />
              {translateOptionLabel ? translateOptionLabel(option.label) : option.label}
            </>
          ),
        }
      })}
    />
  )
}

type SearchableOptionsProps = {
  useOptions: UseOptionsHook
  useList: UseListHook
  onValueChange: (value: string[]) => void
  value: string[]
  multiple?: boolean
  labels: ColumnFilterLabels
  filtering: FilterContext
}

function SearchableOptionsInput({
  useList,
  useOptions,
  onValueChange,
  value,
  multiple,
  labels,
  filtering,
}: SearchableOptionsProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, filtering.debounceMs ?? DEBOUNCE_DELAY_MS)
  const { data, isLoading } = useList(
    {
      ...filtering.listParams,
      search: debouncedSearch,
      id: debouncedSearch ? undefined : value[0],
    },
    { [filtering.queryOptionKey ?? 'query']: { enabled: !!(debouncedSearch || value[0]) } },
  )
  return (
    <OptionsInput
      value={value}
      onValueChange={onValueChange}
      options={useOptions(data)}
      searchValue={search}
      onSearchValueChange={setSearch}
      loading={isLoading}
      multiple={multiple}
      labels={labels}
      translateOptionLabel={filtering.translateOptionLabel}
    />
  )
}
