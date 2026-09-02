import { CheckIcon, ChevronDown, Loader2, XIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { OptionList } from '../option-list'

export type FancyComboboxOption = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export type FancyComboboxLabels = {
  select: string
  notAvailable: string
  searchPlaceholder: string
  noDataFound: string
  typeToSearch: string
  selectAll: string
  loading: string
  loadMore: string
}

const DEFAULT_LABELS: FancyComboboxLabels = {
  select: 'Select...',
  notAvailable: 'NA',
  searchPlaceholder: 'Search...',
  noDataFound: 'No data found',
  typeToSearch: 'Type to search',
  selectAll: 'Select all',
  loading: 'Loading',
  loadMore: 'Load more',
}

export type FancyComboboxProps = Omit<React.ComponentProps<'button'>, 'value' | 'onChange'> & {
  options: FancyComboboxOption[]
  onValueChange: (value: string[]) => void
  value?: string[]
  onSearchValueChange?: (value: string) => void
  placeholder?: string
  maxCount?: number
  modalPopover?: boolean
  multiple?: boolean
  loading?: boolean
  disableClear?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  labels?: Partial<FancyComboboxLabels>
}

function Marker({ checked }: { checked: boolean }) {
  return (
    <div
      className={cn(
        'me-2 flex h-4 w-4 items-center justify-center rounded border border-primary [&&>svg]:size-3',
        checked ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
      )}
    >
      <CheckIcon />
    </div>
  )
}

// Sentinel visibility for the infinite-scroll row; inert where IntersectionObserver is absent.
function useIsVisible(enabled: boolean) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => setIsVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0, rootMargin: '100px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, node])

  return { ref: setNode, isVisible }
}

export function FancyCombobox({
  options,
  onValueChange,
  onSearchValueChange,
  multiple,
  loading,
  value = [],
  placeholder,
  maxCount = 2,
  modalPopover,
  className,
  disableClear,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  labels,
  ...props
}: FancyComboboxProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
  const showLoadMore = !!hasNextPage || !!isFetchingNextPage
  const { ref: loadMoreRef, isVisible: isLoadMoreVisible } = useIsVisible(showLoadMore)

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsPopoverOpen(true)
    } else if (event.key === 'Backspace' && !event.currentTarget.value) {
      const newSelectedValues = [...value]
      newSelectedValues.pop()
      onValueChange(newSelectedValues)
    }
  }

  const toggleOption = (option: string) => {
    if (multiple) {
      const newSelectedValues = value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option]
      onValueChange(newSelectedValues)
    } else {
      onValueChange([option])
      setIsPopoverOpen(false)
    }
  }

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onValueChange([])
    } else {
      onValueChange(options.map((o) => o.value))
    }
  }

  React.useEffect(() => {
    if (
      !isPopoverOpen ||
      !onLoadMore ||
      !hasNextPage ||
      !!isFetchingNextPage ||
      !isLoadMoreVisible
    ) {
      return
    }
    onLoadMore()
  }, [hasNextPage, isFetchingNextPage, isLoadMoreVisible, isPopoverOpen, onLoadMore])

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
      <PopoverTrigger
        render={
          <Button
            {...props}
            disabled={props.disabled || (!options?.length && !onSearchValueChange)}
            onClick={() => setIsPopoverOpen((prev) => !prev)}
            className={cn(
              'flex h-auto min-h-10 w-full items-center justify-between rounded-field border border-input bg-inherit px-1 py-0.5 text-start hover:bg-inherit [&_svg]:pointer-events-auto',
              className,
            )}
          />
        }
      >
        <div className="flex w-full items-stretch justify-between">
          {value.length > 0 && (
            <div className="relative flex grow items-stretch pe-2">
              {multiple ? (
                <div className="no-scrollbar absolute start-0 flex w-full gap-2 overflow-x-auto overflow-y-auto">
                  {value.slice(0, maxCount).map((val) => {
                    const option = options.find((o) => o.value === val)
                    const IconComponent = option?.icon
                    return (
                      <Badge
                        key={val}
                        className="rounded-item-sm px-2 py-1 font-light text-foreground hover:border-border hover:bg-transparent [&&>svg]:size-3"
                        variant="secondary"
                      >
                        {IconComponent && <IconComponent className="me-2 h-4 w-4" />}
                        {option?.label || val}
                        <XIcon
                          className="ms-2 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleOption(val)
                          }}
                        />
                      </Badge>
                    )
                  })}
                </div>
              ) : (
                <span className="absolute start-0 top-0 w-full truncate px-3 pt-0.5 text-start text-foreground">
                  {options.find((o) => o.value === value[0])?.label || l.notAvailable}
                </span>
              )}
            </div>
          )}
          {value.length > maxCount && (
            <Badge
              className="rounded-item-sm px-2 py-1 font-light text-foreground hover:border-border hover:bg-transparent"
              variant="secondary"
            >
              {`+ ${value.length - maxCount}`}
            </Badge>
          )}
          {!value.length && (
            <span className="mx-3 grow text-start text-sm text-muted-foreground">
              {options?.length || onSearchValueChange ? placeholder || l.select : l.notAvailable}
            </span>
          )}
          <div className="flex items-center justify-between">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {value.length > 0 && !disableClear && (
              <XIcon
                className="mx-2 h-4 cursor-pointer text-muted-foreground"
                onClick={(event) => {
                  event.stopPropagation()
                  onValueChange([])
                }}
              />
            )}
            {value.length > 0 && (
              <Separator orientation="vertical" className="flex h-full min-h-6" />
            )}
            <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--anchor-width) p-0"
        align="start"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <OptionList
          placeholder={l.searchPlaceholder}
          onSearchValueChange={onSearchValueChange}
          onSearchKeyDown={handleInputKeyDown}
          empty={!onSearchValueChange && options.length === 0 ? l.noDataFound : l.typeToSearch}
          header={
            multiple &&
            options.length > 1 && (
              <div
                role="option"
                aria-selected={value.length === options.length}
                onClick={handleSelectAll}
                className={cn(
                  value.length === options.length && 'bg-accent/50',
                  'mt-0.5 flex cursor-pointer items-center rounded-item-sm px-2 py-1.5 text-sm',
                )}
              >
                <Marker checked={value.length === options.length} />
                <span className="max-w-sm pe-1">{l.selectAll}</span>
              </div>
            )
          }
          footer={
            showLoadMore && (
              <div ref={loadMoreRef} className="py-2 text-center text-xs text-muted-foreground">
                {isFetchingNextPage ? `${l.loading}...` : l.loadMore}
              </div>
            )
          }
          items={options.map((option) => {
            const isSelected = value.includes(option.value)
            return {
              key: option.value,
              text: option.label,
              selected: isSelected,
              className: cn(isSelected && 'bg-accent/50', 'mt-0.5'),
              onSelect: () => toggleOption(option.value),
              content: (
                <>
                  {multiple ? (
                    <Marker checked={isSelected} />
                  ) : (
                    <CheckIcon
                      className={cn(isSelected ? 'text-foreground' : 'text-transparent')}
                    />
                  )}
                  {option.icon && <option.icon className="me-2 h-4 w-4 text-muted-foreground" />}
                  <span className="max-w-sm pe-1">{option.label}</span>
                </>
              ),
            }
          })}
        />
      </PopoverContent>
    </Popover>
  )
}
