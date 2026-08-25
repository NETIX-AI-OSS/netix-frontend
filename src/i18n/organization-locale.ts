import type { i18n as I18nInstance } from 'i18next'

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
  function clearActiveIdentity(): void {
    activeIdentity = null
    getLocaleRuntime()?.setActiveIdentity(null)
  }

  async function renderLanguage(language: string, persistPreference: boolean): Promise<void> {
    if (persistPreference) await storage.setItem(languageKey, language)
    await i18n.changeLanguage(language)
  }

  async function applyLanguage(language: string): Promise<void> {
    await renderLanguage(language, true)
  }

  async function hydrateBundledLanguage(): Promise<string> {
    const language = (await storage.getItem(languageKey)) || defaultLanguage
    await applyLanguage(language)
    return language
  }

  async function applyEffectiveLocale(locale: EffectiveLocale): Promise<void> {
    const language = locale.resolved_language
    i18n.removeResourceBundle(language, namespace)
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
    // The identity claim must stay synchronous so clearActiveIdentity can race it.
    activeIdentity = identity
    locales.setActiveIdentity(identity)
    if (!(await isHealthy(locales))) return null
    const language = requestedLanguage || (await initialLanguage(identity, user))
    const cached = await locales.hydrate(identity, language)
    if (cached && sameIdentity(activeIdentity, identity)) await applyEffectiveLocale(cached.locale)
    const result = await locales.refreshEffective(identity, language)
    if (sameIdentity(activeIdentity, identity)) await applyEffectiveLocale(result.locale)
    if (await locales.reconcilePendingLanguage(identity)) {
      await storage.removeItem(pendingLanguageKey(identity))
    }
    return result.locale
  }

  async function changeOrganizationLanguage(language: string): Promise<void> {
    const identity = activeIdentity
    if (identity) await storage.setItem(pendingLanguageKey(identity), language)
    await applyLanguage(language)
    const locales = getLocaleRuntime()
    if (!locales || !identity) return
    const synchronized = await locales.setPreferredLanguage(identity, language)
    if (synchronized) await storage.removeItem(pendingLanguageKey(identity))
    if (!synchronized) return
    try {
      const refreshed = await locales.refreshEffective(identity, language)
      if (sameIdentity(activeIdentity, identity)) await applyEffectiveLocale(refreshed.locale)
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
