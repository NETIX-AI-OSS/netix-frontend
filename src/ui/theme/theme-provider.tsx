import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

export type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  /** One key across the fleet so a user's choice follows them between NETIX apps. */
  storageKey?: string
}

export type ThemeProviderState = {
  /** The user's choice: an explicit theme, or "system" to follow the OS. */
  theme: Theme
  /** The theme actually applied right now ("system" resolved against the OS). */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const MEDIA_QUERY = '(prefers-color-scheme: dark)'

export const THEME_STORAGE_KEY = 'netix-theme'

/** Some embedded/old browsers have no matchMedia. */
const canMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

const prefersDark = () => canMatchMedia() && window.matchMedia(MEDIA_QUERY).matches

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  // Only the OS preference lives in state; the applied theme derives from it in render.
  const [osTheme, setOsTheme] = useState<ResolvedTheme>(() => (prefersDark() ? 'dark' : 'light'))

  useEffect(() => {
    if (!canMatchMedia()) return

    const media = window.matchMedia(MEDIA_QUERY)
    const onChange = (event: MediaQueryListEvent) => setOsTheme(event.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme: ResolvedTheme = theme === 'system' ? osTheme : theme

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    // Keep native UI (scrollbars, form controls) in sync with the theme.
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: Theme) => {
        try {
          localStorage.setItem(storageKey, next)
        } catch {
          // storage blocked (private mode) — the choice still applies for this session
        }
        setThemeState(next)
      },
    }),
    [theme, resolvedTheme, storageKey],
  )

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => useContext(ThemeProviderContext)
