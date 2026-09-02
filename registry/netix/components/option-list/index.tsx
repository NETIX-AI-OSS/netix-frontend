import { SearchIcon } from 'lucide-react'
import * as React from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type OptionListItem = {
  key: string
  /** What the built-in search matches against. */
  text: string
  content: React.ReactNode
  selected?: boolean
  className?: string
  onSelect: () => void
}

export type OptionListProps = {
  items: OptionListItem[]
  placeholder: string
  empty: React.ReactNode
  /** Provide to take over searching (remote); omitted means the list filters itself. */
  searchValue?: string
  onSearchValueChange?: (value: string) => void
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

// Stands in for shadcn's cmdk-backed <Command>: same shape, no extra runtime dependency.
export function OptionList({
  items,
  placeholder,
  empty,
  searchValue,
  onSearchValueChange,
  onSearchKeyDown,
  header,
  footer,
  className,
}: OptionListProps) {
  const [query, setQuery] = React.useState('')
  const search = onSearchValueChange ? '' : query.trim().toLowerCase()
  const visible = search ? items.filter((i) => i.text.toLowerCase().includes(search)) : items

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-2 border-b px-3">
        <SearchIcon className="size-4 shrink-0 opacity-50" />
        <Input
          role="searchbox"
          className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
          placeholder={placeholder}
          value={onSearchValueChange ? searchValue : query}
          onKeyDown={onSearchKeyDown}
          onChange={(event) => {
            setQuery(event.target.value)
            onSearchValueChange?.(event.target.value)
          }}
        />
      </div>
      <div role="listbox" className="max-h-64 overflow-y-auto p-1">
        {header}
        {visible.length === 0 ? (
          <div className="py-6 text-center text-sm">{empty}</div>
        ) : (
          visible.map((item) => (
            <div
              key={item.key}
              role="option"
              tabIndex={0}
              aria-selected={!!item.selected}
              className={cn(
                'flex cursor-pointer items-center rounded-item-sm px-2 py-1.5 text-sm hover:bg-accent',
                item.className,
              )}
              onClick={item.onSelect}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  item.onSelect()
                }
              }}
            >
              {item.content}
            </div>
          ))
        )}
        {footer}
      </div>
    </div>
  )
}
