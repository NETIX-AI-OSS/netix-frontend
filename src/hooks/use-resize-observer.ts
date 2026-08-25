import { useEffect, useState } from 'react'

export function useResizeObserver(ref: HTMLElement | null) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    resizeObserver.observe(ref)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref])

  return size
}
