const root = document.documentElement

const run = async () => {
  vi.resetModules()
  // @ts-expect-error the pre-paint guard is a plain classic script, not a typed module
  await import('./theme-init.js')
}

const mockMatchMedia = (matches: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches })),
  )

beforeEach(() => {
  root.className = ''
  root.style.colorScheme = ''
  localStorage.clear()
  mockMatchMedia(false)
})

afterEach(() => vi.unstubAllGlobals())

it('applies the stored theme', async () => {
  localStorage.setItem('netix-theme', 'dark')
  await run()
  expect(root.classList.contains('dark')).toBe(true)
  expect(root.style.colorScheme).toBe('dark')
})

it('applies light for an explicit light choice even when the OS is dark', async () => {
  localStorage.setItem('netix-theme', 'light')
  mockMatchMedia(true)
  await run()
  expect(root.classList.contains('light')).toBe(true)
  expect(root.style.colorScheme).toBe('light')
})

it('follows the OS when nothing is stored', async () => {
  mockMatchMedia(true)
  await run()
  expect(root.classList.contains('dark')).toBe(true)
})

it('falls back to light when the OS prefers light', async () => {
  localStorage.setItem('netix-theme', 'system')
  await run()
  expect(root.classList.contains('light')).toBe(true)
})

it('leaves the document untouched when storage throws', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  await run()
  expect(root.className).toBe('')
})
