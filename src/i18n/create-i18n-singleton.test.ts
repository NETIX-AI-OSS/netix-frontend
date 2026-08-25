import i18next from 'i18next'
import { describe, expect, it } from 'vitest'

import { createI18n } from './create-i18n'

// Isolated file: the default branch initializes the shared i18next singleton.
describe('createI18n default instance', () => {
  it('initializes the shared i18next singleton', () => {
    const i18n = createI18n({
      resources: { en: { translation: { hello: 'Hello' } } },
      storage: null,
    })
    expect(i18n).toBe(i18next)
    expect(i18n.t('hello')).toBe('Hello')
  })
})
