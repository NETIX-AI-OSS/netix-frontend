import type { i18n as I18nInstance } from 'i18next'

import { baseLanguageTag } from './normalize-language'

export type LocaleTranslations = { [key: string]: string | LocaleTranslations }

export type EffectiveLocale = {
  application: string
  requested_language: string
  resolved_language: string
  available_languages: string[]
  revision: string
  translations: LocaleTranslations
}

export type LocaleIdentity = { userId: string | number; organizationId: string | number }

export type LocaleUser = {
  user_id?: string | number
  id?: string | number
  organization_id?: string | number
  organization?: string | number
  preferred_language?: string
  organization_default_language?: string
}

/** The subset of envoy-ts-auth's `LocaleRuntime` this module drives. */
export interface LocaleRuntimeLike {
  setActiveIdentity(identity: LocaleIdentity | null): void
  hydrate(identity: LocaleIdentity, language: string): Promise<{ locale: EffectiveLocale } | null>
  refreshEffective(identity: LocaleIdentity, language: string): Promise<{ locale: EffectiveLocale }>
  setPreferredLanguage(identity: LocaleIdentity, language: string): Promise<boolean>
  reconcilePendingLanguage(identity: LocaleIdentity): Promise<boolean>
  checkHealth?(): Promise<boolean>
}

/** Asynchronous storage contract shared by `createBrowserLocaleStorage` and AsyncStorage. */
export type LocaleAsyncStorage = {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

export type OrganizationLocaleConfig = {
  i18n: I18nInstance
  storage: LocaleAsyncStorage
  /** Called again whenever the trailing-slash-trimmed API origin changes. */
  createRuntime: (apiBaseUrl: string) => LocaleRuntimeLike
  getApiBaseUrl: () => string | null | undefined
  languageKey?: string
  namespace?: string
  pendingKeyPrefix?: string
  defaultLanguage?: string
  /** When true and the runtime exposes checkHealth, an unhealthy locale API skips the refresh. */
  healthGate?: boolean
}

export type OrganizationLocale = {
  getLocaleRuntime: () => LocaleRuntimeLike | null
  clearActiveIdentity: () => void
  applyLanguage: (language: string) => Promise<void>
  hydrateBundledLanguage: () => Promise<string>
  applyEffectiveLocale: (locale: EffectiveLocale) => Promise<void>
  refreshOrganizationLocale: (
    user: LocaleUser,
    requestedLanguage?: string,
  ) => Promise<EffectiveLocale | null>
  changeOrganizationLanguage: (language: string) => Promise<void>
}

const PENDING_LANGUAGE_KEY = 'organization-locale:pending-language:v1'

export function localeIdentity(user: LocaleUser | null | undefined): LocaleIdentity | null {
  const userId = user?.user_id ?? user?.id
  const organizationId = user?.organization_id ?? user?.organization
  return userId == null || organizationId == null ? null : { userId, organizationId }
}

function sameIdentity(left: LocaleIdentity | null, right: LocaleIdentity): boolean {
  return (
    left != null &&
    String(left.userId) === String(right.userId) &&
    String(left.organizationId) === String(right.organizationId)
  )
}

/** Identity-scoped organization locale coordinator; one instance per app. */
export function createOrganizationLocale(config: OrganizationLocaleConfig): OrganizationLocale {
  const {
    i18n,
    storage,
    createRuntime,
    getApiBaseUrl,
    languageKey = 'language',
    namespace = 'translation',
    pendingKeyPrefix = PENDING_LANGUAGE_KEY,
    defaultLanguage = 'en',
    healthGate = false,
  } = config

  let runtime: LocaleRuntimeLike | null = null
  let runtimeOrigin = ''
  let activeIdentity: LocaleIdentity | null = null
  let generation = 0
  const storageWrites = new Map<string, Promise<void>>()

  // Serialize writes per key: a slow old preference must finish before the newer value is
  // persisted. Generation checks skip work that became stale while waiting in the queue.
  function writeStorage(key: string, value: string | null): Promise<void> {
    const request = generation
    const previous = storageWrites.get(key) ?? Promise.resolve()
    const next = previous
      .catch(() => undefined)
      .then(async () => {
        if (request !== generation) return
        if (value === null) await storage.removeItem(key)
        else await storage.setItem(key, value)
      })
    storageWrites.set(key, next)
    return next
  }
  // The shipped catalog per language, captured before the first server merge touches it, so every
  // apply resets to that floor and layers the server over it (server wins per key, bundled fills
  // gaps, a key dropped server-side reverts on the next apply instead of lingering).
  const bundled = new Map<string, LocaleTranslations>()

  const pendingLanguageKey = (identity: LocaleIdentity) =>
    `${pendingKeyPrefix}:${encodeURIComponent(String(identity.userId))}:${encodeURIComponent(String(identity.organizationId))}`

  function getLocaleRuntime(): LocaleRuntimeLike | null {
    const apiBaseUrl = getApiBaseUrl()?.replace(/\/+$/, '')
    if (!apiBaseUrl) return null
    if (!runtime || runtimeOrigin !== apiBaseUrl) {
      runtimeOrigin = apiBaseUrl
      runtime = createRuntime(apiBaseUrl)
    }
    return runtime
  }

  /** Logout or organization switch: in-flight locale results for the old identity are dropped. */
  function restoreBundledCatalogs(): void {
    for (const [language, floor] of bundled) {
      i18n.removeResourceBundle(language, namespace)
      i18n.addResourceBundle(language, namespace, floor, true, true)
    }
  }

  function clearActiveIdentity(): void {
    generation += 1
    activeIdentity = null
    restoreBundledCatalogs()
    getLocaleRuntime()?.setActiveIdentity(null)
  }

  async function renderLanguage(language: string, persistPreference: boolean): Promise<void> {
    const request = generation
    if (persistPreference) await writeStorage(languageKey, language)
    if (request !== generation) return
    await i18n.changeLanguage(language)
  }

  async function applyLanguage(language: string): Promise<void> {
    await renderLanguage(language, true)
  }

  async function hydrateBundledLanguage(): Promise<string> {
    const request = generation
    const language = (await storage.getItem(languageKey)) || defaultLanguage
    if (request === generation) await applyLanguage(language)
    return language
  }

  async function applyEffectiveLocale(locale: EffectiveLocale): Promise<void> {
    const language = locale.resolved_language
    const requested = baseLanguageTag(locale.requested_language)
    if (requested && requested !== baseLanguageTag(language)) {
      const requestedCatalog =
        bundled.get(requested) ?? i18n.getResourceBundle(requested, namespace)
      // A release can ship a language before the locale API carries its terminology overrides.
      // Keep the bundled choice when the API returns an unrelated language as its fallback.
      if (requestedCatalog && Object.keys(requestedCatalog).length > 0) {
        await renderLanguage(requested, false)
        return
      }
    }
    const floor = bundled.get(language) ?? i18n.getResourceBundle(language, namespace) ?? {}
    bundled.set(language, floor)
    // Reset to the bundled floor, then merge: server values win per key, keys the server does not
    // carry keep their bundled text, and keys dropped server-side do not linger.
    i18n.removeResourceBundle(language, namespace)
    i18n.addResourceBundle(language, namespace, floor, true, true)
    i18n.addResourceBundle(language, namespace, locale.translations, true, true)
    await renderLanguage(language, false)
  }

  async function initialLanguage(identity: LocaleIdentity, user: LocaleUser): Promise<string> {
    return (
      (await storage.getItem(pendingLanguageKey(identity))) ||
      user.preferred_language ||
      user.organization_default_language ||
      (await storage.getItem(languageKey)) ||
      defaultLanguage
    )
  }

  async function isHealthy(locales: LocaleRuntimeLike): Promise<boolean> {
    if (!healthGate || !locales.checkHealth) return true
    try {
      return await locales.checkHealth()
    } catch {
      return false
    }
  }

  async function refreshOrganizationLocale(
    user: LocaleUser,
    requestedLanguage?: string,
  ): Promise<EffectiveLocale | null> {
    const identity = localeIdentity(user)
    const locales = getLocaleRuntime()
    if (!identity || !locales) return null
    // Claims and invalidation are synchronous, including two requests for the same identity.
    const request = ++generation
    if (!sameIdentity(activeIdentity, identity)) restoreBundledCatalogs()
    activeIdentity = identity
    locales.setActiveIdentity(identity)
    const current = () => request === generation && sameIdentity(activeIdentity, identity)
    const language = requestedLanguage || (await initialLanguage(identity, user))
    if (!current()) return null
    // Preference remains authoritative even while the locale service is unhealthy.
    await renderLanguage(language, false)
    if (!current() || !(await isHealthy(locales)) || !current()) return null
    const cached = await locales.hydrate(identity, language)
    if (!current()) return null
    if (cached) await applyEffectiveLocale(cached.locale)
    if (!current()) return null
    const result = await locales.refreshEffective(identity, language)
    if (!current()) return null
    await applyEffectiveLocale(result.locale)
    if (!current()) return null
    const synchronized = await locales.reconcilePendingLanguage(identity)
    if (current() && synchronized) await writeStorage(pendingLanguageKey(identity), null)
    return current() ? result.locale : null
  }

  async function changeOrganizationLanguage(language: string): Promise<void> {
    const request = ++generation
    const identity = activeIdentity
    const current = () =>
      request === generation && (!identity || sameIdentity(activeIdentity, identity))
    if (identity) await writeStorage(pendingLanguageKey(identity), language)
    if (!current()) return
    await applyLanguage(language)
    if (!current()) return
    const locales = getLocaleRuntime()
    if (!locales || !identity) return
    const synchronized = await locales.setPreferredLanguage(identity, language)
    if (!current()) return
    if (synchronized) await writeStorage(pendingLanguageKey(identity), null)
    if (!current() || !synchronized) return
    try {
      const refreshed = await locales.refreshEffective(identity, language)
      if (current()) await applyEffectiveLocale(refreshed.locale)
    } catch {
      // Keep bundled resources and the pending preference while offline.
    }
  }

  return {
    getLocaleRuntime,
    clearActiveIdentity,
    applyLanguage,
    hydrateBundledLanguage,
    applyEffectiveLocale,
    refreshOrganizationLocale,
    changeOrganizationLanguage,
  }
}
