import { useEffect, useState } from 'react'

import { applyUpdater, type SearchParamsBinding, type Updater } from './search-params'

export type UrlTabOptions = {
  param?: string
  clearOnChange?: string[]
}

/** URL-backed tab state without importing a router. */
export function useUrlTab(binding: SearchParamsBinding, options: UrlTabOptions = {}) {
  const [params, setParams] = binding
  const { param = 'tab', clearOnChange = [] } = options
  const [tab, setTab] = useState<string>()

  const writeTab = (next?: string) => {
    const updated = new URLSearchParams(params)
    if (next) updated.set(param, next)
    else updated.delete(param)
    for (const key of clearOnChange) updated.delete(key)
    setParams(updated)
  }

  const updateTab = (updater: Updater<string | undefined>) => {
    setTab((previous) => {
      const next = applyUpdater(updater, previous)
      writeTab(next)
      return next
    })
  }

  /* URLSearchParams is the external source of truth for this state. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTab(params.get(param) || undefined)
  }, [params, param])

  return { tab, updateTab }
}
