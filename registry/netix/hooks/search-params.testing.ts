import { useState } from 'react'

import type { SearchParamsBinding } from './search-params'

/** Test-only stand-in for react-router's useSearchParams; not exported from the package. */
export function useTestSearchParams(initial = ''): SearchParamsBinding {
  const [params, setParams] = useState(() => new URLSearchParams(initial))
  return [params, setParams]
}
