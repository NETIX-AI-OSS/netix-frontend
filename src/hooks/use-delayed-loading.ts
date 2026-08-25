import { useEffect, useState } from 'react'

export function useDelayedLoading(isLoading: boolean, delayMs = 150) {
  const [showLoading, setShowLoading] = useState(isLoading && delayMs <= 0)

  // The whole hook exists to write state from an effect; the rule cannot express that.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false)
      return
    }

    if (delayMs <= 0) {
      setShowLoading(true)
      return
    }

    setShowLoading(false)
    const timeoutId = globalThis.setTimeout(() => setShowLoading(true), delayMs)
    return () => globalThis.clearTimeout(timeoutId)
  }, [delayMs, isLoading])

  return showLoading
}
