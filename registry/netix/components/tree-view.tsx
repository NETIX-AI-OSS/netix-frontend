import { ChevronRight, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

export type TreeViewItem<TData = unknown> = {
  id: string
  label: string
  children?: TreeViewItem<TData>[]
  data?: TData
  hasChildren?: boolean
  childrenLoaded?: boolean
}

export type TreeViewLabels = {
  collapse: (label: string) => string
  expand: (label: string) => string
  loadingChildren: string
  noChildNodes: string
}

const DEFAULT_LABELS: TreeViewLabels = {
  collapse: (label) => `Collapse ${label}`,
  expand: (label) => `Expand ${label}`,
  loadingChildren: 'Loading children...',
  noChildNodes: 'No child nodes',
}

export type TreeViewProps<TData = unknown> = {
  items: TreeViewItem<TData>[]
  selectedId?: string
  onItemSelect?: (item: TreeViewItem<TData>) => void
  onItemToggle?: (item: TreeViewItem<TData>, expanded: boolean) => void
  className?: string
  emptyText?: string
  defaultExpandAll?: boolean
  loadingItemIds?: string[]
  labels?: Partial<TreeViewLabels>
}

const collectAllExpandableIds = <TData,>(items: TreeViewItem<TData>[], bag: Set<string>) => {
  items.forEach((item) => {
    if (item.hasChildren ?? Boolean(item.children?.length)) {
      bag.add(item.id)
    }

    if (item.children?.length) {
      collectAllExpandableIds(item.children, bag)
    }
  })
}

const collectAllIds = <TData,>(items: TreeViewItem<TData>[], bag: Set<string>) => {
  items.forEach((item) => {
    bag.add(item.id)
    if (item.children?.length) {
      collectAllIds(item.children, bag)
    }
  })
}

const TreeView = <TData,>({
  items,
  selectedId,
  onItemSelect,
  onItemToggle,
  className,
  emptyText = 'No data',
  defaultExpandAll = true,
  loadingItemIds = [],
  labels,
}: TreeViewProps<TData>) => {
  const l = { ...DEFAULT_LABELS, ...labels }
  const initialExpanded = useMemo(() => {
    if (!defaultExpandAll) return new Set<string>()
    const bag = new Set<string>()
    collectAllExpandableIds(items, bag)
    return bag
  }, [defaultExpandAll, items])
  const loadingIdSet = useMemo(() => new Set(loadingItemIds), [loadingItemIds])

  const [expandedIds, setExpandedIds] = useState<Set<string>>(initialExpanded)

  useEffect(() => {
    if (defaultExpandAll) {
      // Re-expanding on every items change is the donor contract for lazily loaded trees.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedIds(initialExpanded)
      return
    }

    setExpandedIds((prev) => {
      const validIds = new Set<string>()
      collectAllIds(items, validIds)

      const next = new Set<string>()
      prev.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id)
        }
      })

      return next
    })
  }, [defaultExpandAll, initialExpanded, items])

  const toggleNode = (item: TreeViewItem<TData>) => {
    const nextExpanded = !expandedIds.has(item.id)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        next.add(item.id)
      }
      return next
    })

    onItemToggle?.(item, nextExpanded)
  }

  const renderItems = (nodes: TreeViewItem<TData>[], depth = 0) => (
    <ul
      role={depth === 0 ? 'tree' : 'group'}
      className={cn('space-y-1', depth === 0 ? '' : 'mt-1 ps-4')}
    >
      {nodes.map((item) => {
        const hasChildren = item.hasChildren ?? Boolean(item.children?.length)
        const isExpanded = expandedIds.has(item.id)
        const isSelected = selectedId === item.id
        const isLoading = loadingIdSet.has(item.id)
        const isChildrenLoaded = item.childrenLoaded ?? true

        return (
          <li
            key={item.id}
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected}
          >
            <div className="flex items-center gap-1">
              {hasChildren ? (
                <button
                  type="button"
                  className="h-7 w-7 rounded-md border border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => toggleNode(item)}
                  aria-label={isExpanded ? l.collapse(item.label) : l.expand(item.label)}
                >
                  {isLoading ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight
                      className={cn(
                        'mx-auto h-4 w-4 transition-transform',
                        isExpanded ? 'rotate-90' : '',
                      )}
                    />
                  )}
                </button>
              ) : (
                <span className="inline-block h-7 w-7" aria-hidden />
              )}
              <button
                type="button"
                className={cn(
                  'min-h-8 flex-1 rounded-md px-2 py-1 text-start text-sm transition-colors',
                  isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent',
                )}
                onClick={() => onItemSelect?.(item)}
              >
                {item.label}
              </button>
            </div>
            {hasChildren && isExpanded && isLoading ? (
              <p className="mt-1 ps-12 text-xs text-muted-foreground">{l.loadingChildren}</p>
            ) : null}
            {hasChildren && isExpanded && !isLoading && item.children?.length
              ? renderItems(item.children, depth + 1)
              : null}
            {hasChildren &&
            isExpanded &&
            !isLoading &&
            isChildrenLoaded &&
            !item.children?.length ? (
              <p className="mt-1 ps-12 text-xs text-muted-foreground">{l.noChildNodes}</p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )

  if (!items.length) {
    return (
      <div className={cn('rounded-md border p-6 text-sm text-muted-foreground', className)}>
        {emptyText}
      </div>
    )
  }

  return <div className={cn('rounded-md border p-2', className)}>{renderItems(items)}</div>
}

export { TreeView }
