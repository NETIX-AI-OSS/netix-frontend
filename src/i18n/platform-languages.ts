import type { Direction } from './create-i18n'

export const PLATFORM_LANGUAGES = ['en', 'ar', 'fr', 'es', 'nl', 'de', 'ru'] as const

export type PlatformLanguage = (typeof PLATFORM_LANGUAGES)[number]

export const PLATFORM_LANGUAGE_INFO = {
  en: { nativeName: 'English', direction: 'ltr' },
  ar: { nativeName: 'العربية', direction: 'rtl' },
  fr: { nativeName: 'Français', direction: 'ltr' },
  es: { nativeName: 'Español', direction: 'ltr' },
  nl: { nativeName: 'Nederlands', direction: 'ltr' },
  de: { nativeName: 'Deutsch', direction: 'ltr' },
  ru: { nativeName: 'Русский', direction: 'ltr' },
} as const satisfies Record<PlatformLanguage, { nativeName: string; direction: Direction }>
