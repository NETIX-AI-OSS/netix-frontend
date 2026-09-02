import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

import { STYLE_NAMES } from '../tokens/style-names'

export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

/** The design styles the token layer ships; the shape axis, orthogonal to light/dark. */
export const STYLES = STYLE_NAMES
export type Style = (typeof STYLES)[number]

export type ThemeProviderProps = {
  children: ReactNode
  /** Overrides the `data-default-theme` attribute on <html>; last resort is "system". */
  defaultTheme?: Theme
  /** Overrides the `data-default-style` attribute on <html>; last resort is the first style. */
  defaultStyle?: Style
  /** Overrides the `data-theme-key` attribute on <html>; last resort is the fleet key. */
  storageKey?: string
  /** Overrides the `data-style-key` attribute on <html>; last resort is the fleet key. */
  styleStorageKey?: string
}

export type ThemeProviderState = {
  /** The user's choice: an explicit theme, or "system" to follow the OS. */
  theme: Theme
  /** The theme actually applied right now ("system" resolved against the OS). */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  /** The applied design style — component shape, independent of light/dark. */
  style: Style
  setStyle: (style: Style) => void
}

const MEDIA_QUERY = '(prefers-color-scheme: dark)'

/** One key across the fleet so a user's choice follows them between NETIX apps. */
export const THEME_STORAGE_KEY = 'netix-theme'
export const STYLE_STORAGE_KEY = 'netix-style'

const DEFAULT_STYLE: Style = STYLES[0]

const asStyle = (value: string | null | undefined): Style | undefined =>
  STYLES.includes(value as Style) ? (value as Style) : undefined

/**
 * Defaults come from the same `data-theme-key` / `data-default-theme` attributes on <html>
 * that the pre-paint initializer (theme-init.js) reads, so provider and script cannot drift.
 */
export function datasetDefaults() {
  const root = typeof document !== 'undefined' ? document.documentElement : undefined
  return {
    storageKey: root?.dataset.themeKey || THEME_STORAGE_KEY,
    defaultTheme: (root?.dataset.defaultTheme as Theme | undefined) || 'system',
    styleStorageKey: root?.dataset.styleKey || STYLE_STORAGE_KEY,
    defaultStyle: asStyle(root?.dataset.defaultStyle) || DEFAULT_STYLE,
  }
}

/** Some embedded/old browsers have no matchMedia. */
const canMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

const prefersDark = () => canMatchMedia() && window.matchMedia(MEDIA_QUERY).matches

const read = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const persist = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage blocked (private mode) — the choice still applies for this session
  }
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
  style: DEFAULT_STYLE,
  setStyle: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme,
  defaultStyle,
  storageKey,
  styleStorageKey,
}: ThemeProviderProps) {
  const defaults = useMemo(() => datasetDefaults(), [])
  const resolvedStorageKey = storageKey ?? defaults.storageKey
  const resolvedDefaultTheme = defaultTheme ?? defaults.defaultTheme
  const resolvedStyleKey = styleStorageKey ?? defaults.styleStorageKey
  const resolvedDefaultStyle = defaultStyle ?? defaults.defaultStyle

  const [theme, setThemeState] = useState<Theme>(
    () => (read(resolvedStorageKey) as Theme | null) || resolvedDefaultTheme,
  )

  const [style, setStyleState] = useState<Style>(
    () => asStyle(read(resolvedStyleKey)) || resolvedDefaultStyle,
  )

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

  useEffect(() => {
    window.document.documentElement.setAttribute('data-style', style)
  }, [style])

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: Theme) => {
        persist(resolvedStorageKey, next)
        setThemeState(next)
      },
      style,
      setStyle: (next: Style) => {
        persist(resolvedStyleKey, next)
        setStyleState(next)
      },
    }),
    [theme, resolvedTheme, resolvedStorageKey, style, resolvedStyleKey],
  )

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => useContext(ThemeProviderContext)
