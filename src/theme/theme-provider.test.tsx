import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { THEME_STORAGE_KEY, ThemeProvider, type ThemeProviderProps, useTheme } from './index'
import { datasetDefaults } from './theme-provider'

const listeners = new Set<(event: MediaQueryListEvent) => void>()

/** matchMedia stub whose "change" event we can fire from a test. */
const stubMatchMedia = (matches: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      addEventListener: (_: string, handler: (event: MediaQueryListEvent) => void) =>
        listeners.add(handler),
      removeEventListener: (_: string, handler: (event: MediaQueryListEvent) => void) =>
        listeners.delete(handler),
    })),
  )

const Probe = () => {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <>
      <span data-testid="state">{`${theme}/${resolvedTheme}`}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('system')}>system</button>
    </>
  )
}

const setup = (props: Partial<ThemeProviderProps> = {}) =>
  render(
    <ThemeProvider {...props}>
      <Probe />
    </ThemeProvider>,
  )

const state = () => screen.getByTestId('state').textContent
const root = document.documentElement

beforeEach(() => {
  listeners.clear()
  localStorage.clear()
  root.className = ''
  root.style.colorScheme = ''
  delete root.dataset.themeKey
  delete root.dataset.defaultTheme
  stubMatchMedia(false)
})

afterEach(() => vi.unstubAllGlobals())

it('follows the OS by default and applies the class plus color-scheme', () => {
  stubMatchMedia(true)
  setup()
  expect(state()).toBe('system/dark')
  expect(root.classList.contains('dark')).toBe(true)
  expect(root.style.colorScheme).toBe('dark')
})

it('restores the stored choice over the default', () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'dark')
  setup({ defaultTheme: 'light' })
  expect(state()).toBe('dark/dark')
})

it('honours defaultTheme when nothing is stored', () => {
  setup({ defaultTheme: 'light' })
  expect(state()).toBe('light/light')
})

it('reads its defaults from the <html> dataset the pre-paint script uses', () => {
  root.dataset.themeKey = 'acme-theme'
  root.dataset.defaultTheme = 'dark'
  localStorage.setItem('acme-theme', 'light')
  setup()
  expect(state()).toBe('light/light')

  localStorage.clear()
  setup()
  expect(screen.getAllByTestId('state').at(-1)?.textContent).toBe('dark/dark')
})

it('lets explicit props override the dataset', async () => {
  root.dataset.themeKey = 'acme-theme'
  root.dataset.defaultTheme = 'dark'
  setup({ defaultTheme: 'light', storageKey: 'prop-theme' })
  expect(state()).toBe('light/light')
  await userEvent.click(screen.getByRole('button', { name: 'dark' }))
  expect(localStorage.getItem('prop-theme')).toBe('dark')
  expect(localStorage.getItem('acme-theme')).toBeNull()
})

it('falls back to the fleet defaults without a document', () => {
  const realDocument = document
  vi.stubGlobal('document', undefined)
  const defaults = datasetDefaults()
  vi.stubGlobal('document', realDocument)
  expect(defaults).toEqual({ storageKey: THEME_STORAGE_KEY, defaultTheme: 'system' })
})

it('persists a new choice under the shared key and swaps the class', async () => {
  setup()
  await userEvent.click(screen.getByRole('button', { name: 'dark' }))
  expect(state()).toBe('dark/dark')
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  expect(root.classList.contains('light')).toBe(false)
})

it('writes to a custom storage key', async () => {
  setup({ storageKey: 'app-theme' })
  await userEvent.click(screen.getByRole('button', { name: 'dark' }))
  expect(localStorage.getItem('app-theme')).toBe('dark')
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
})

it('tracks a live OS change only while following the system', async () => {
  setup()
  expect(state()).toBe('system/light')
  act(() => listeners.forEach((handler) => handler({ matches: true } as MediaQueryListEvent)))
  expect(state()).toBe('system/dark')

  await userEvent.click(screen.getByRole('button', { name: 'dark' }))
  act(() => listeners.forEach((handler) => handler({ matches: false } as MediaQueryListEvent)))
  expect(state()).toBe('dark/dark')
})

it('drops the OS listener on unmount', () => {
  const { unmount } = setup()
  expect(listeners.size).toBe(1)
  unmount()
  expect(listeners.size).toBe(0)
})

it('still applies a theme when storage reads throw', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  setup({ defaultTheme: 'dark' })
  expect(state()).toBe('dark/dark')
})

it('still applies a theme when storage writes throw', async () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  setup()
  await userEvent.click(screen.getByRole('button', { name: 'dark' }))
  expect(state()).toBe('dark/dark')
})

it('degrades to light where matchMedia is missing', () => {
  vi.stubGlobal('matchMedia', undefined)
  setup()
  expect(state()).toBe('system/light')
  expect(listeners.size).toBe(0)
})

it('returns the inert default outside a provider', () => {
  render(<Probe />)
  expect(state()).toBe('system/light')
  expect(() => screen.getByRole('button', { name: 'dark' }).click()).not.toThrow()
})
