import type { i18n as I18nInstance } from 'i18next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createOrganizationLocale,
  type EffectiveLocale,
  type LocaleAsyncStorage,
  type LocaleIdentity,
  localeIdentity,
  type LocaleRuntimeLike,
} from './organization-locale'

const PENDING = 'organization-locale:pending-language:v1:7:9'

const effective = (language: string): EffectiveLocale => ({
  application: 'app',
  requested_language: language,
  resolved_language: language,
  available_languages: ['en', 'ar'],
  revision: '1',
  translations: { hello: language },
})

const makeStorage = (initial: Record<string, string> = {}) => {
  const store = new Map(Object.entries(initial))
  const storage: LocaleAsyncStorage = {
    getItem: (key) => Promise.resolve(store.get(key) ?? null),
    setItem: (key, value) => Promise.resolve(void store.set(key, value)),
    removeItem: (key) => Promise.resolve(void store.delete(key)),
  }
  return { storage, store }
}

const makeI18n = () => {
  const i18n = {
    changeLanguage: vi.fn(() => Promise.resolve()),
    removeResourceBundle: vi.fn(),
    addResourceBundle: vi.fn(),
  }
  return { i18n, instance: i18n as unknown as I18nInstance }
}

const makeRuntime = (overrides: Partial<LocaleRuntimeLike> = {}) => ({
  setActiveIdentity: vi.fn(),
  hydrate: vi.fn(() => Promise.resolve(null)),
  refreshEffective: vi.fn((_identity: LocaleIdentity, language: string) =>
    Promise.resolve({ locale: effective(language) }),
  ),
  setPreferredLanguage: vi.fn(() => Promise.resolve(true)),
  reconcilePendingLanguage: vi.fn(() => Promise.resolve(false)),
  ...overrides,
})

const user = { user_id: 7, organization_id: 9, preferred_language: 'es' }

type Setup = {
  initial?: Record<string, string>
  runtime?: ReturnType<typeof makeRuntime>
  apiBaseUrl?: string | null
  healthGate?: boolean
}

const setup = ({
  initial,
  runtime = makeRuntime(),
  apiBaseUrl = 'https://um/',
  healthGate,
}: Setup = {}) => {
  const { storage, store } = makeStorage(initial)
  const { i18n, instance } = makeI18n()
  const createRuntime = vi.fn(() => runtime as LocaleRuntimeLike)
  let baseUrl = apiBaseUrl
  const locale = createOrganizationLocale({
    i18n: instance,
    storage,
    createRuntime,
    getApiBaseUrl: () => baseUrl,
    healthGate,
  })
  return {
    locale,
    store,
    i18n,
    runtime,
    createRuntime,
    setBaseUrl: (value: string | null) => {
      baseUrl = value
    },
  }
}

describe('localeIdentity', () => {
  it('prefers the explicit ids and accepts the aliases', () => {
    expect(localeIdentity({ user_id: 1, organization_id: 2 })).toEqual({
      userId: 1,
      organizationId: 2,
    })
    expect(localeIdentity({ id: 3, organization: 4 })).toEqual({ userId: 3, organizationId: 4 })
  })

  it('returns null when either half is missing', () => {
    expect(localeIdentity(null)).toBeNull()
    expect(localeIdentity(undefined)).toBeNull()
    expect(localeIdentity({ user_id: 1 })).toBeNull()
    expect(localeIdentity({ organization_id: 2 })).toBeNull()
  })
})

describe('getLocaleRuntime', () => {
  it('trims trailing slashes and caches per origin', () => {
    const { locale, createRuntime, runtime } = setup()
    expect(locale.getLocaleRuntime()).toBe(runtime)
    expect(locale.getLocaleRuntime()).toBe(runtime)
    expect(createRuntime).toHaveBeenCalledTimes(1)
    expect(createRuntime).toHaveBeenCalledWith('https://um')
  })

  it('rebuilds when the origin changes', () => {
    const { locale, createRuntime, setBaseUrl } = setup()
    locale.getLocaleRuntime()
    setBaseUrl('https://other')
    locale.getLocaleRuntime()
    expect(createRuntime).toHaveBeenCalledTimes(2)
  })

  it('returns null without a base url', () => {
    const { locale, createRuntime, setBaseUrl } = setup({ apiBaseUrl: null })
    expect(locale.getLocaleRuntime()).toBeNull()
    setBaseUrl('')
    expect(locale.getLocaleRuntime()).toBeNull()
    expect(createRuntime).not.toHaveBeenCalled()
  })
})

describe('bundled language', () => {
  it('applies the stored language and persists it', async () => {
    const { locale, store, i18n } = setup({ initial: { language: 'ar' } })
    await expect(locale.hydrateBundledLanguage()).resolves.toBe('ar')
    expect(i18n.changeLanguage).toHaveBeenCalledWith('ar')
    expect(store.get('language')).toBe('ar')
  })

  it('falls back to the default language', async () => {
    const { locale } = setup()
    await expect(locale.hydrateBundledLanguage()).resolves.toBe('en')
  })

  it('applyLanguage persists the preference', async () => {
    const { locale, store } = setup()
    await locale.applyLanguage('es')
    expect(store.get('language')).toBe('es')
  })
})

describe('applyEffectiveLocale', () => {
  it('replaces the bundle and switches language without persisting', async () => {
    const { locale, store, i18n } = setup()
    await locale.applyEffectiveLocale(effective('ar'))
    expect(i18n.removeResourceBundle).toHaveBeenCalledWith('ar', 'translation')
    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'ar',
      'translation',
      { hello: 'ar' },
      true,
      true,
    )
    expect(store.has('language')).toBe(false)
  })
})

describe('refreshOrganizationLocale', () => {
  it('returns null without an identity or a runtime', async () => {
    const { locale } = setup()
    await expect(locale.refreshOrganizationLocale({ user_id: 7 })).resolves.toBeNull()

    const offline = setup({ apiBaseUrl: null })
    await expect(offline.locale.refreshOrganizationLocale(user)).resolves.toBeNull()
  })

  it('applies the cached catalog then the refreshed one and clears the pending key', async () => {
    const runtime = makeRuntime({
      hydrate: vi.fn(() => Promise.resolve({ locale: effective('ar') })),
      reconcilePendingLanguage: vi.fn(() => Promise.resolve(true)),
    })
    const { locale, i18n, store } = setup({ initial: { [PENDING]: 'ar' }, runtime })
    await expect(locale.refreshOrganizationLocale(user)).resolves.toEqual(effective('ar'))
    expect(runtime.setActiveIdentity).toHaveBeenCalledWith({ userId: 7, organizationId: 9 })
    expect(i18n.addResourceBundle).toHaveBeenCalledTimes(2)
    expect(store.has(PENDING)).toBe(false)
  })

  it('keeps the pending key when reconciliation is still pending', async () => {
    const { locale, store } = setup({ initial: { [PENDING]: 'ar' } })
    await locale.refreshOrganizationLocale(user)
    expect(store.get(PENDING)).toBe('ar')
  })

  it('resolves the boot language by pending, preference, stored, then default', async () => {
    const pending = setup({ initial: { [PENDING]: 'ar', language: 'es' } })
    await pending.locale.refreshOrganizationLocale(user)
    expect(pending.runtime.refreshEffective).toHaveBeenCalledWith(expect.anything(), 'ar')

    const preferred = setup({ initial: { language: 'ar' } })
    await preferred.locale.refreshOrganizationLocale(user)
    expect(preferred.runtime.refreshEffective).toHaveBeenCalledWith(expect.anything(), 'es')

    const stored = setup({ initial: { language: 'ar' } })
    await stored.locale.refreshOrganizationLocale({ user_id: 7, organization_id: 9 })
    expect(stored.runtime.refreshEffective).toHaveBeenCalledWith(expect.anything(), 'ar')

    const fallback = setup()
    await fallback.locale.refreshOrganizationLocale({ user_id: 7, organization_id: 9 })
    expect(fallback.runtime.refreshEffective).toHaveBeenCalledWith(expect.anything(), 'en')
  })

  it('honours an explicitly requested language', async () => {
    const { locale, runtime } = setup({ initial: { [PENDING]: 'ar' } })
    await locale.refreshOrganizationLocale(user, 'es')
    expect(runtime.refreshEffective).toHaveBeenCalledWith(expect.anything(), 'es')
  })
})

describe('identity races', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const slow = <T>(value: T, ms: number) =>
    new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

  it('drops cached and refreshed catalogs once another identity takes over', async () => {
    const runtime = makeRuntime({
      hydrate: vi.fn((_identity: LocaleIdentity, language: string) =>
        slow({ locale: effective(language) }, 10),
      ),
      refreshEffective: vi.fn((_identity: LocaleIdentity, language: string) =>
        slow({ locale: effective(language) }, 20),
      ),
    })
    const { locale, i18n } = setup({ runtime })
    const first = locale.refreshOrganizationLocale(user, 'ar')
    const second = locale.refreshOrganizationLocale(
      { user_id: 8, organization_id: 9, preferred_language: 'es' },
      'es',
    )
    await vi.advanceTimersByTimeAsync(60)
    await Promise.all([first, second])
    const applied = i18n.addResourceBundle.mock.calls.map((call) => call[0])
    expect(applied).toEqual(['es', 'es'])
  })

  it('drops results after the active identity is cleared', async () => {
    const runtime = makeRuntime({
      refreshEffective: vi.fn((_identity: LocaleIdentity, language: string) =>
        slow({ locale: effective(language) }, 20),
      ),
    })
    const { locale, i18n } = setup({ runtime })
    const pendingRefresh = locale.refreshOrganizationLocale(user, 'ar')
    locale.clearActiveIdentity()
    await vi.advanceTimersByTimeAsync(60)
    await pendingRefresh
    expect(i18n.addResourceBundle).not.toHaveBeenCalled()
    expect(runtime.setActiveIdentity).toHaveBeenLastCalledWith(null)
  })

  it('clearActiveIdentity is safe without a runtime', () => {
    const { locale } = setup({ apiBaseUrl: null })
    expect(() => locale.clearActiveIdentity()).not.toThrow()
  })

  it('skips the post-change refresh when the identity moved on', async () => {
    const runtime = makeRuntime({
      refreshEffective: vi.fn((_identity: LocaleIdentity, language: string) =>
        slow({ locale: effective(language) }, 20),
      ),
      setPreferredLanguage: vi.fn(() => slow(true, 5)),
    })
    const { locale } = setup({ runtime })
    const boot = locale.refreshOrganizationLocale(user, 'ar')
    await vi.advanceTimersByTimeAsync(60)
    await boot
    const change = locale.changeOrganizationLanguage('es')
    locale.clearActiveIdentity()
    await vi.advanceTimersByTimeAsync(60)
    await change
    expect(runtime.refreshEffective).toHaveBeenCalledTimes(2)
  })
})

describe('changeOrganizationLanguage', () => {
  it('applies the language and returns when no identity is active', async () => {
    const { locale, store, runtime } = setup()
    await locale.changeOrganizationLanguage('ar')
    expect(store.get('language')).toBe('ar')
    expect(store.has(PENDING)).toBe(false)
    expect(runtime.setPreferredLanguage).not.toHaveBeenCalled()
  })

  it('returns when the runtime is unavailable but keeps the pending preference', async () => {
    const { locale, store, setBaseUrl, runtime } = setup()
    await locale.refreshOrganizationLocale(user, 'ar')
    setBaseUrl(null)
    await locale.changeOrganizationLanguage('es')
    expect(store.get(PENDING)).toBe('es')
    expect(runtime.setPreferredLanguage).not.toHaveBeenCalled()
  })

  it('clears the pending key and re-applies the refreshed catalog once synchronized', async () => {
    const { locale, store, i18n, runtime } = setup()
    await locale.refreshOrganizationLocale(user, 'ar')
    i18n.addResourceBundle.mockClear()
    await locale.changeOrganizationLanguage('es')
    expect(runtime.setPreferredLanguage).toHaveBeenCalledWith(
      { userId: 7, organizationId: 9 },
      'es',
    )
    expect(store.has(PENDING)).toBe(false)
    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'es',
      'translation',
      { hello: 'es' },
      true,
      true,
    )
  })

  it('keeps the pending preference when the server rejects the sync', async () => {
    const runtime = makeRuntime({ setPreferredLanguage: vi.fn(() => Promise.resolve(false)) })
    const { locale, store } = setup({ runtime })
    await locale.refreshOrganizationLocale(user, 'ar')
    await locale.changeOrganizationLanguage('es')
    expect(store.get(PENDING)).toBe('es')
    expect(runtime.refreshEffective).toHaveBeenCalledTimes(1)
  })

  it('swallows a failing post-sync refresh', async () => {
    let calls = 0
    const runtime = makeRuntime({
      refreshEffective: vi.fn((_identity: LocaleIdentity, language: string) => {
        calls += 1
        return calls > 1
          ? Promise.reject(new Error('offline'))
          : Promise.resolve({ locale: effective(language) })
      }),
    })
    const { locale } = setup({ runtime })
    await locale.refreshOrganizationLocale(user, 'ar')
    await expect(locale.changeOrganizationLanguage('es')).resolves.toBeUndefined()
  })
})

describe('configuration overrides', () => {
  it('honours languageKey, namespace, pendingKeyPrefix and defaultLanguage', async () => {
    const { storage, store } = makeStorage()
    const { i18n, instance } = makeI18n()
    const runtime = makeRuntime({ reconcilePendingLanguage: vi.fn(() => Promise.resolve(true)) })
    const locale = createOrganizationLocale({
      i18n: instance,
      storage,
      createRuntime: () => runtime,
      getApiBaseUrl: () => 'https://um',
      languageKey: 'app:lang',
      namespace: 'common',
      pendingKeyPrefix: 'pending',
      defaultLanguage: 'ar',
    })
    await expect(locale.hydrateBundledLanguage()).resolves.toBe('ar')
    expect(store.get('app:lang')).toBe('ar')
    await locale.refreshOrganizationLocale({ user_id: 7, organization_id: 9 })
    expect(i18n.addResourceBundle).toHaveBeenLastCalledWith(
      'ar',
      'common',
      { hello: 'ar' },
      true,
      true,
    )
    await locale.changeOrganizationLanguage('es')
    expect(runtime.setPreferredLanguage).toHaveBeenCalled()
    expect([...store.keys()]).toContain('app:lang')
  })

  it('encodes identity parts into the pending key', async () => {
    const runtime = makeRuntime({ setPreferredLanguage: vi.fn(() => Promise.resolve(false)) })
    const { locale, store } = setup({ runtime })
    await locale.refreshOrganizationLocale({ user_id: 'a/b', organization_id: 'c d' }, 'ar')
    await locale.changeOrganizationLanguage('es')
    expect([...store.keys()]).toContain('organization-locale:pending-language:v1:a%2Fb:c%20d')
  })
})

describe('healthGate', () => {
  it('skips the refresh when checkHealth reports unhealthy', async () => {
    const runtime = makeRuntime({ checkHealth: vi.fn(() => Promise.resolve(false)) })
    const { locale } = setup({ runtime, healthGate: true })

    expect(await locale.refreshOrganizationLocale(user)).toBeNull()
    expect(runtime.hydrate).not.toHaveBeenCalled()
    expect(runtime.refreshEffective).not.toHaveBeenCalled()
  })

  it('treats a throwing checkHealth as unhealthy', async () => {
    const runtime = makeRuntime({ checkHealth: vi.fn(() => Promise.reject(new Error('down'))) })
    const { locale } = setup({ runtime, healthGate: true })

    expect(await locale.refreshOrganizationLocale(user)).toBeNull()
    expect(runtime.refreshEffective).not.toHaveBeenCalled()
  })

  it('proceeds when healthy, when the runtime has no checkHealth, or when the gate is off', async () => {
    const healthy = makeRuntime({ checkHealth: vi.fn(() => Promise.resolve(true)) })
    expect(
      await setup({ runtime: healthy, healthGate: true }).locale.refreshOrganizationLocale(user),
    ).not.toBeNull()

    expect(await setup({ healthGate: true }).locale.refreshOrganizationLocale(user)).not.toBeNull()

    const unhealthy = makeRuntime({ checkHealth: vi.fn(() => Promise.resolve(false)) })
    expect(
      await setup({ runtime: unhealthy }).locale.refreshOrganizationLocale(user),
    ).not.toBeNull()
    expect(unhealthy.checkHealth).not.toHaveBeenCalled()
  })
})

describe('organization_default_language', () => {
  it('sits after preferred_language and before the stored language', async () => {
    const { locale, runtime } = setup({ initial: { language: 'ar' } })
    await locale.refreshOrganizationLocale({
      user_id: 7,
      organization_id: 9,
      organization_default_language: 'es',
    })
    expect(runtime.refreshEffective).toHaveBeenCalledWith(expect.anything(), 'es')

    const preferred = setup()
    await preferred.locale.refreshOrganizationLocale({
      user_id: 7,
      organization_id: 9,
      preferred_language: 'en',
      organization_default_language: 'es',
    })
    expect(preferred.runtime.refreshEffective).toHaveBeenCalledWith(expect.anything(), 'en')
  })
})
