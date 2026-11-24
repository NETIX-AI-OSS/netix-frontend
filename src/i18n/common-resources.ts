import ar from './locales/common.ar.json'
import de from './locales/common.de.json'
import en from './locales/common.en.json'
import es from './locales/common.es.json'
import fr from './locales/common.fr.json'
import nl from './locales/common.nl.json'
import ru from './locales/common.ru.json'
import type { PlatformLanguage } from './platform-languages'

export const COMMON_NAMESPACE = 'common'

export type CommonLanguage = PlatformLanguage
export type CommonKey = keyof typeof en
export const commonTranslations = { ar, en, es, fr, nl, de, ru } satisfies Record<
  CommonLanguage,
  Record<CommonKey, string>
>

/** Mergeable i18next resource bundle; apps deep-merge it under the `common` namespace. */
export const commonResources = {
  ar: { [COMMON_NAMESPACE]: ar },
  en: { [COMMON_NAMESPACE]: en },
  es: { [COMMON_NAMESPACE]: es },
  fr: { [COMMON_NAMESPACE]: fr },
  nl: { [COMMON_NAMESPACE]: nl },
  de: { [COMMON_NAMESPACE]: de },
  ru: { [COMMON_NAMESPACE]: ru },
} satisfies Record<CommonLanguage, Record<typeof COMMON_NAMESPACE, Record<CommonKey, string>>>
