import { describe, expect, it } from 'vitest'

import { normalizeLanguage } from './normalize-language'

const supported = ['en', 'ar', 'es'] as const

describe('normalizeLanguage', () => {
  it('reduces a region tag to its supported base tag', () => {
    expect(normalizeLanguage(' AR-eg ', supported, 'en')).toBe('ar')
  })

  it('keeps an already-normalized tag', () => {
    expect(normalizeLanguage('es', supported, 'en')).toBe('es')
  })

  it('falls back for unsupported, empty, null and undefined values', () => {
    expect(normalizeLanguage('ru', supported, 'en')).toBe('en')
    expect(normalizeLanguage('', supported, 'en')).toBe('en')
    expect(normalizeLanguage(null, supported, 'en')).toBe('en')
    expect(normalizeLanguage(undefined, supported, 'en')).toBe('en')
  })
})
