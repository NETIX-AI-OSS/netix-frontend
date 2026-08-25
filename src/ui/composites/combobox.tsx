import { Check, ChevronDown, XIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../utils/cn'
import { Button, Popover, PopoverContent, PopoverTrigger, Separator } from '../primitives'
import type { FilterOption } from './data-table-types'
import { LoadingState } from './loading-state'
import { OptionList } from './option-list'

export type ComboboxLabels = { select: string; search: string; noDataFound: string }

const DEFAULT_LABELS: ComboboxLabels = {
  select: 'Select option',
  search: 'Search',
  noDataFound: 'No data found',
}

export type ComboboxProps = Omit<React.ComponentProps<'button'>, 'value' | 'onChange'> & {
  options: FilterOption[]
  onValueChange: (value?: string) => void
  value?: string
  placeholder?: string
  loading?: boolean
  modalPopover?: boolean
  labels?: Partial<ComboboxLabels>
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder,
  loading,
  modalPopover = true,
  labels,
  ...props
}: ComboboxProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modalPopover}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex h-auto min-h-10 w-full items-center justify-between rounded-md border-input px-1 py-0.5 text-start hover:bg-card/80"
          {...props}
        >
          <div className="mx-auto flex w-full items-center">
            <span className="grow overflow-hidden text-ellipsis px-3 text-start text-sm text-foreground">
              {value
                ? options.find((option) => option.value === value)?.label
                : placeholder || l.select}
            </span>
            <div className="flex items-center justify-between">
              {loading && <LoadingState variant="button" />}
              {!!value && (
                <>
                  <Button
                    size="sm"
                    className="bg-transparent p-0 hover:bg-transparent"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation()
                      onValueChange()
                    }}
                  >
                    <XIcon className="mx-2 h-4 cursor-pointer text-muted-foreground" />
                  </Button>
                  <Separator orientation="vertical" className="flex h-full min-h-6" />
                </>
              )}
              <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[200px] p-0" align="start">
        <OptionList
          placeholder={placeholder || `${l.search}...`}
          empty={l.noDataFound}
          items={options.map((option) => ({
            key: option.value,
            text: option.label,
            selected: value === option.value,
            onSelect: () => {
              onValueChange(option.value)
              setOpen(false)
            },
            content: (
              <>
                <Check
                  className={cn(
                    'me-2 h-4 w-4',
                    value === option.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="max-w-sm pe-1">{option.label}</span>
              </>
            ),
          }))}
        />
      </PopoverContent>
    </Popover>
  )
}
