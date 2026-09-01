import { useEffect, useState } from 'react'

import { applyUpdater, type SearchParamsBinding, type Updater } from './search-params'

export type TabsOptions = {
  /** Params dropped whenever the tab changes; cafm passes ['filters']. */
  clearOnChange?: string[]
}

export function useTabs(binding: SearchParamsBinding, options?: TabsOptions) {
  const [params, setParams] = binding
  const [tab, setTab] = useState<string>()

  const writeParams = (next?: string) => {
    const updated = new URLSearchParams(params)
    if (next) {
      updated.set('tab', next)
    } else {
      updated.delete('tab')
    }
    options?.clearOnChange?.forEach((key) => updated.delete(key))
    setParams(updated)
  }

  const updateTab = (updater: Updater<string | undefined>) => {
    if (typeof updater !== 'function') {
      writeParams(updater)
      setTab(updater)
      return
    }
    setTab((previous) => {
      const next = applyUpdater(updater, previous)
      writeParams(next)
      return next
    })
  }

  // Syncs state from the URL, the external source of truth for the active tab.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTab(params.get('tab') || undefined)
  }, [params])

  return { tab, updateTab }
}
