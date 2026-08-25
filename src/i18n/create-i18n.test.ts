import { createInstance, type i18n as I18nInstance, type Resource } from 'i18next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createI18n, type I18nSyncStorage } from './create-i18n'

const resources: Resource = {
  en: { translation: { hello: 'Hello' } },
  ar: { translation: { hello: 'مرحبا' } },
  es: { translation: { hello: 'Hola' } },
}

const memoryStorage = (initial: Record<string, string> = {}): I18nSyncStorage => {
  const store = new Map(Object.entries(initial))
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
  }
}

const html = () => document.documentElement

beforeEach(() => {
  html().removeAttribute('lang')
  html().removeAttribute('dir')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createI18n', () => {
  it('boots from the persisted language and normalizes region tags', () => {
    const i18n = createI18n({
      instance: createInstance(),
      resources,
      storage: memoryStorage({ language: 'AR-EG' }),
    })
    expect(i18n.resolvedLanguage).toBe('ar')
    expect(html().lang).toBe('ar')
    expect(html().dir).toBe('rtl')
  })

  it('falls back when nothing is persisted and leaves ltr documents alone', () => {
    const i18n = createI18n({ instance: createInstance(), resources, storage: memoryStorage() })
    expect(i18n.resolvedLanguage).toBe('en')
    expect(html().dir).toBe('ltr')
  })

  it('persists the normalized language on every change', async () => {
    const storage = memoryStorage()
    const i18n = createI18n({ instance: createInstance(), resources, storage })
    await i18n.changeLanguage('es-MX')
    expect(storage.getItem('language')).toBe('es')
    expect(html().lang).toBe('es-MX')
    expect(html().dir).toBe('ltr')
  })

  it('honours storageKey, supportedLngs and fallbackLng', async () => {
    const storage = memoryStorage({ 'app:lang': 'ru' })
    const i18n = createI18n({
      instance: createInstance(),
      resources,
      storage,
      storageKey: 'app:lang',
      supportedLngs: ['en', 'ar'],
      fallbackLng: 'ar',
    })
    expect(i18n.resolvedLanguage).toBe('ar')
    await i18n.changeLanguage('es')
    expect(storage.getItem('app:lang')).toBe('ar')
  })

  it('lets an explicit lng win over the persisted value', () => {
    const i18n = createI18n({
      instance: createInstance(),
      resources,
      lng: 'es',
      storage: memoryStorage({ language: 'ar' }),
    })
    expect(i18n.resolvedLanguage).toBe('es')
  })

  it('skips persistence when storage is null or persistOnChange is off', async () => {
    const noStorage = createI18n({ instance: createInstance(), resources, storage: null })
    expect(noStorage.resolvedLanguage).toBe('en')

    const storage = memoryStorage({ language: 'ar' })
    const i18n = createI18n({
      instance: createInstance(),
      resources,
      storage,
      persistOnChange: false,
    })
    await i18n.changeLanguage('es')
    expect(storage.getItem('language')).toBe('ar')
  })

  it('leaves lng unset on native and delegates direction to the injected applier', async () => {
    const applyDirection = vi.fn()
    const i18n = createI18n({
      instance: createInstance(),
      resources,
      platform: 'native',
      storage: memoryStorage({ language: 'ar' }),
      applyDirection,
    })
    expect(i18n.resolvedLanguage).toBe('en')
    expect(html().hasAttribute('dir')).toBe(false)
    await i18n.changeLanguage('ar')
    expect(applyDirection).toHaveBeenLastCalledWith('ar', 'rtl')
  })

  it('registers plugins and merges initOptions last', () => {
    const instance = createInstance()
    const use = vi.spyOn(instance, 'use')
    const plugin = {
      type: 'postProcessor' as const,
      name: 'noop',
      process: (value: string) => value,
    }
    const i18n = createI18n({
      instance,
      resources,
      plugins: [plugin],
      debug: true,
      initOptions: { debug: false, returnEmptyString: false },
    })
    expect(use).toHaveBeenCalledWith(plugin)
    expect(i18n.options.debug).toBe(false)
    expect(i18n.options.returnEmptyString).toBe(false)
  })

  it('detects localStorage when no storage is supplied', async () => {
    const store = new Map<string, string>([['language', 'ar']])
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    })
    const i18n = createI18n({ instance: createInstance(), resources })
    expect(i18n.resolvedLanguage).toBe('ar')
    await i18n.changeLanguage('es')
    expect(store.get('language')).toBe('es')
  })

  it('survives a localStorage accessor that throws', () => {
    vi.stubGlobal('globalThis', globalThis)
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked')
      },
    })
    try {
      const i18n = createI18n({ instance: createInstance(), resources })
      expect(i18n.resolvedLanguage).toBe('en')
    } finally {
      Reflect.deleteProperty(globalThis, 'localStorage')
    }
  })

  it('ignores a storage backend whose accessors throw', async () => {
    const storage: I18nSyncStorage = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
    }
    const i18n = createI18n({ instance: createInstance(), resources, storage })
    expect(i18n.resolvedLanguage).toBe('en')
    await expect(i18n.changeLanguage('ar')).resolves.toBeDefined()
  })

  it('treats a missing localStorage as no storage', () => {
    vi.stubGlobal('localStorage', undefined)
    const i18n = createI18n({ instance: createInstance(), resources })
    expect(i18n.resolvedLanguage).toBe('en')
  })

  it('is a no-op on the document when there is none', () => {
    vi.stubGlobal('document', undefined)
    expect(() => createI18n({ instance: createInstance(), resources, storage: null })).not.toThrow()
  })

  it('falls back to fallbackLng when the instance reports no language', () => {
    const applyDirection = vi.fn()
    const stub = {
      use: vi.fn(),
      init: vi.fn(),
      on: vi.fn(),
      dir: vi.fn(() => 'ltr' as const),
      resolvedLanguage: undefined,
      language: undefined,
    } as unknown as I18nInstance
    createI18n({ instance: stub, resources, storage: null, fallbackLng: 'es', applyDirection })
    expect(applyDirection).toHaveBeenCalledWith('es', 'ltr')
  })
})
