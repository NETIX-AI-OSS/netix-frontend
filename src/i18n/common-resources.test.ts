import { describe, expect, it } from 'vitest'

import {
  COMMON_NAMESPACE,
  type CommonLanguage,
  commonResources,
  commonTranslations,
} from './common-resources'

const languages: CommonLanguage[] = ['en', 'ar', 'es']

describe('common resources', () => {
  it('ships the 32 fleet-common keys plus na in every language', () => {
    const keys = Object.keys(commonTranslations.en)
    expect(keys).toHaveLength(33)
    expect(keys).toContain('na')
    for (const language of languages) {
      expect(Object.keys(commonTranslations[language]).sort()).toEqual([...keys].sort())
    }
  })

  it('has no empty translation', () => {
    for (const language of languages) {
      for (const value of Object.values(commonTranslations[language])) {
        expect(value.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('exposes a mergeable resource bundle under the common namespace', () => {
    expect(COMMON_NAMESPACE).toBe('common')
    expect(commonResources.ar[COMMON_NAMESPACE]).toBe(commonTranslations.ar)
    expect(commonResources.es[COMMON_NAMESPACE].yes).toBe('Sí')
    expect(commonResources.en[COMMON_NAMESPACE].na).toBe('NA')
  })
})
