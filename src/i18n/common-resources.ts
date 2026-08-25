import ar from './locales/common.ar.json'
import en from './locales/common.en.json'
import es from './locales/common.es.json'

export const COMMON_NAMESPACE = 'common'

export const commonTranslations = { ar, en, es }

export type CommonLanguage = keyof typeof commonTranslations
export type CommonKey = keyof typeof en

/** Mergeable i18next resource bundle; apps deep-merge it under the `common` namespace. */
export const commonResources = {
  ar: { [COMMON_NAMESPACE]: ar },
  en: { [COMMON_NAMESPACE]: en },
  es: { [COMMON_NAMESPACE]: es },
}
