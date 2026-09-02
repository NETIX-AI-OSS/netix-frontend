import { createDevLoginPrompt } from './dev-login'

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const field = (name: string) => document.querySelector<HTMLInputElement>(`#netix-dev-login-${name}`)
const form = () => document.querySelector('form')
const button = () => document.querySelector<HTMLButtonElement>('button[type="submit"]')
const alert = () => document.querySelector<HTMLElement>('[role="alert"]')

const fillAndSubmit = async (username: string, password: string) => {
  field('username')!.value = username
  field('password')!.value = password
  button()!.click()
  await flush()
}

afterEach(() => {
  // Unstub first: one test replaces `document` itself.
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

it('mounts a form a password manager can recognise', () => {
  createDevLoginPrompt({ login: vi.fn() }).open()

  expect(form()).not.toBeNull()
  expect(field('username')).toMatchObject({ name: 'username', type: 'text' })
  expect(field('username')!.getAttribute('autocomplete')).toBe('username')
  expect(field('password')).toMatchObject({ name: 'password', type: 'password' })
  expect(field('password')!.getAttribute('autocomplete')).toBe('current-password')
  expect(button()!.textContent).toBe('Sign in')
  expect(document.activeElement).toBe(field('username'))
})

it('hands the typed credentials to login, then unmounts and reports success', async () => {
  const login = vi.fn().mockResolvedValue(true)
  const onSuccess = vi.fn()

  createDevLoginPrompt({ login, onSuccess }).open()
  await fillAndSubmit('dev@netix', 'hunter2')

  expect(login).toHaveBeenCalledWith('dev@netix', 'hunter2')
  expect(onSuccess).toHaveBeenCalledTimes(1)
  expect(form()).toBeNull()
})

it('never lets the form navigate away mid-sign-in', () => {
  createDevLoginPrompt({ login: vi.fn().mockResolvedValue(true), onSuccess: vi.fn() }).open()

  const event = new Event('submit', { bubbles: true, cancelable: true })
  form()!.dispatchEvent(event)

  expect(event.defaultPrevented).toBe(true)
})

it('falls back to a full page reload when no onSuccess is given', async () => {
  // jsdom's location.reload is an unforgeable no-op that reports via console.error; silence it.
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const login = vi.fn().mockResolvedValue(true)

  createDevLoginPrompt({ login }).open()
  await fillAndSubmit('dev@netix', 'hunter2')

  expect(login).toHaveBeenCalledTimes(1)
  consoleError.mockRestore()
})

it('reports any non-true result inline and keeps the form open to retry', async () => {
  // envoy-ts-auth resolves `undefined` (not false) on a 401 — non-true means failure.
  const login = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce(true)
  const onSuccess = vi.fn()

  createDevLoginPrompt({ login, onSuccess }).open()
  await fillAndSubmit('dev@netix', 'wrong')

  expect(alert()!.hidden).toBe(false)
  expect(alert()!.textContent).toContain('Sign-in failed')
  expect(button()!.disabled).toBe(false)
  expect(onSuccess).not.toHaveBeenCalled()

  await fillAndSubmit('dev@netix', 'right')

  expect(login).toHaveBeenCalledTimes(2)
  expect(onSuccess).toHaveBeenCalledTimes(1)
})

it('treats a thrown login as a failure', async () => {
  const login = vi.fn().mockRejectedValue(new Error('staging unreachable'))
  const onSuccess = vi.fn()

  createDevLoginPrompt({ login, onSuccess }).open()
  await fillAndSubmit('dev@netix', 'hunter2')

  expect(alert()!.hidden).toBe(false)
  expect(onSuccess).not.toHaveBeenCalled()
})

it('offers the credential to a browser that implements PasswordCredential', async () => {
  class FakePasswordCredential {
    constructor(readonly data: { id: string; password: string }) {}
  }
  const store = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('PasswordCredential', FakePasswordCredential)
  vi.stubGlobal('navigator', { credentials: { store } })
  const onSuccess = vi.fn()

  createDevLoginPrompt({ login: vi.fn().mockResolvedValue(true), onSuccess }).open()
  await fillAndSubmit('dev@netix', 'hunter2')

  expect(store).toHaveBeenCalledWith(
    expect.objectContaining({ data: { id: 'dev@netix', password: 'hunter2' } }),
  )
  expect(onSuccess).toHaveBeenCalledTimes(1)
})

it('signs in anyway when the save is declined or the credentials container is missing', async () => {
  class FakePasswordCredential {}
  const store = vi.fn().mockRejectedValue(new Error('declined'))
  vi.stubGlobal('PasswordCredential', FakePasswordCredential)
  vi.stubGlobal('navigator', { credentials: { store } })
  const onSuccess = vi.fn()
  const devLogin = createDevLoginPrompt({ login: vi.fn().mockResolvedValue(true), onSuccess })

  devLogin.open()
  await fillAndSubmit('dev@netix', 'hunter2')
  expect(onSuccess).toHaveBeenCalledTimes(1)

  vi.stubGlobal('navigator', {})
  devLogin.open()
  await fillAndSubmit('dev@netix', 'hunter2')
  expect(onSuccess).toHaveBeenCalledTimes(2)
})

it('ignores open while a form is already mounted, and reopens after close', async () => {
  const devLogin = createDevLoginPrompt({ login: vi.fn() })

  devLogin.open()
  devLogin.open()
  expect(document.querySelectorAll('form')).toHaveLength(1)

  devLogin.close()
  expect(form()).toBeNull()
  devLogin.open()
  expect(form()).not.toBeNull()
})

it('is inert without a document to mount into', () => {
  const devLogin = createDevLoginPrompt({ login: vi.fn() })

  const body = document.body
  document.documentElement.removeChild(body)
  devLogin.open()
  document.documentElement.append(body)
  expect(form()).toBeNull()

  vi.stubGlobal('document', undefined)
  expect(() => devLogin.open()).not.toThrow()
})

it('close before open is a harmless no-op', () => {
  expect(() => createDevLoginPrompt({ login: vi.fn() }).close()).not.toThrow()
})
