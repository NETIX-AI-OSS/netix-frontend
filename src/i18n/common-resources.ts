import ar from './locales/common.ar.json'
import de from './locales/common.de.json'
import en from './locales/common.en.json'
import es from './locales/common.es.json'
import fr from './locales/common.fr.json'
import nl from './locales/common.nl.json'

export const COMMON_NAMESPACE = 'common'

export const commonTranslations = { ar, en, es, fr, nl, de }

export type CommonLanguage = keyof typeof commonTranslations
export type CommonKey = keyof typeof en

/** Mergeable i18next resource bundle; apps deep-merge it under the `common` namespace. */
export const commonResources = {
  ar: { [COMMON_NAMESPACE]: ar },
  en: { [COMMON_NAMESPACE]: en },
  es: { [COMMON_NAMESPACE]: es },
  fr: { [COMMON_NAMESPACE]: fr },
  nl: { [COMMON_NAMESPACE]: nl },
  de: { [COMMON_NAMESPACE]: de },
}
