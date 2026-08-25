import i18next, { type i18n as I18nInstance, type InitOptions, type Resource } from 'i18next'

import { normalizeLanguage } from './normalize-language'

export type Direction = 'ltr' | 'rtl'

export type I18nPlugin = Parameters<I18nInstance['use']>[0]

/** Synchronous key/value storage; `localStorage` satisfies it. */
export type I18nSyncStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type CreateI18nOptions = {
  resources: Resource
  /** Defaults to the shared i18next singleton. */
  instance?: I18nInstance
  /** Passed to `instance.use()` in order; apps supply `initReactI18next`. */
  plugins?: I18nPlugin[]
  /** Defaults to the keys of `resources`. */
  supportedLngs?: readonly string[]
  fallbackLng?: string
  /** Overrides the persisted/detected boot language. */
  lng?: string
  debug?: boolean
  /** 'native' leaves `lng` unset so the organization-locale runtime owns it. */
  platform?: 'web' | 'native'
  /** `null` disables persistence; omitted falls back to `localStorage` when reachable. */
  storage?: I18nSyncStorage | null
  storageKey?: string
  persistOnChange?: boolean
  /** RN apps pass an `I18nManager` applier; the default writes `<html lang|dir>`. */
  applyDirection?: (language: string, dir: Direction) => void
  /** Merged last, so it can override any default init option. */
  initOptions?: InitOptions
}

function detectStorage(): I18nSyncStorage | null {
  try {
    return typeof globalThis.localStorage?.getItem === 'function' ? globalThis.localStorage : null
  } catch {
    return null
  }
}

function readStored(storage: I18nSyncStorage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function writeStored(storage: I18nSyncStorage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    // Storage is unavailable in privacy mode; direction still updates in memory.
  }
}

function applyDocumentDirection(language: string, dir: Direction): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language
  document.documentElement.dir = dir
}

/** Boots an i18next instance and keeps document direction and the stored language in sync. */
export function createI18n(options: CreateI18nOptions): I18nInstance {
  const {
    resources,
    instance = i18next,
    plugins = [],
    supportedLngs = Object.keys(resources),
    fallbackLng = 'en',
    debug = false,
    platform = 'web',
    storageKey = 'language',
    persistOnChange = true,
    applyDirection = applyDocumentDirection,
    initOptions,
  } = options

  const storage = options.storage === undefined ? detectStorage() : options.storage
  const normalize = (value: string | null | undefined) =>
    normalizeLanguage(value, supportedLngs, fallbackLng)
  const stored = platform === 'native' ? null : readStored(storage, storageKey)
  const lng = options.lng ?? (stored === null ? undefined : normalize(stored))

  for (const plugin of plugins) instance.use(plugin)
  void instance.init({
    resources,
    lng,
    fallbackLng,
    debug,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnNull: false,
    ...initOptions,
  })

  const onLanguageChanged = (language: string) => {
    if (persistOnChange && storage) writeStored(storage, storageKey, normalize(language))
    applyDirection(language, instance.dir(language))
  }
  instance.on('languageChanged', onLanguageChanged)
  onLanguageChanged(instance.resolvedLanguage ?? instance.language ?? fallbackLng)
  return instance
}
