import { createInstance } from 'i18next'
import { expect, it } from 'vitest'

import { createOrganizationLocale } from './organization-locale'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

async function setupStorageRace() {
  const i18n = createInstance()
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: { label: 'English' } },
      fr: { translation: { label: 'Français' } },
      de: { translation: { label: 'Deutsch' } },
    },
  })
  const values = new Map<string, string>()
  const storage = {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: async (key: string) => {
      values.delete(key)
    },
  }
  const runtime = {
    setActiveIdentity() {},
    async hydrate() {
      return null
    },
    async refreshEffective(_identity: unknown, language: string) {
      return {
        locale: {
          application: 'test',
          requested_language: language,
          resolved_language: language,
          available_languages: ['en', 'fr', 'de'],
          revision: 'r1',
          translations: { label: `Tenant B ${language}` },
        },
      }
    },
    async reconcilePendingLanguage() {
      return false
    },
    async setPreferredLanguage() {
      return false
    },
  }
  const helper = createOrganizationLocale({
    i18n,
    storage,
    createRuntime: () => runtime,
    getApiBaseUrl: () => 'https://users.test',
  })
  return { i18n, values, storage, helper }
}

it('ignores a bundled-language read completed after another tenant selects its language', async () => {
  const { i18n, storage, helper } = await setupStorageRace()
  const oldRead = deferred<string | null>()
  const readStarted = deferred<void>()
  const original = storage.getItem
  let first = true
  storage.getItem = async (key) => {
    if (key === 'language' && first) {
      first = false
      readStarted.resolve()
      return oldRead.promise
    }
    return original(key)
  }
  const hydration = helper.hydrateBundledLanguage()
  await readStarted.promise
  helper.clearActiveIdentity()
  await helper.refreshOrganizationLocale({ user_id: 2, organization_id: 20 }, 'fr')
  oldRead.resolve('en')
  await hydration
  expect(i18n.resolvedLanguage).toBe('fr')
  expect(i18n.t('label')).toBe('Tenant B fr')
})

it('keeps the newest rendered and persisted language when old writes finish late', async () => {
  const { i18n, values, storage, helper } = await setupStorageRace()
  const release = deferred<void>()
  const started = deferred<void>()
  storage.setItem = async (key, value) => {
    if (key === 'language' && value === 'fr') {
      started.resolve()
      await release.promise
    }
    values.set(key, value)
  }
  const first = helper.changeOrganizationLanguage('fr')
  await started.promise
  const superseded = helper.changeOrganizationLanguage('ar')
  const newest = helper.changeOrganizationLanguage('de')
  release.resolve()
  await Promise.all([first, superseded, newest])
  expect(i18n.resolvedLanguage).toBe('de')
  expect(values.get('language')).toBe('de')
})

it('keeps the newest identity-scoped pending preference when old writes finish late', async () => {
  const { i18n, values, storage, helper } = await setupStorageRace()
  await helper.refreshOrganizationLocale({ user_id: 2, organization_id: 20 }, 'en')
  const pendingKey = 'organization-locale:pending-language:v1:2:20'
  const release = deferred<void>()
  const started = deferred<void>()
  storage.setItem = async (key, value) => {
    if (key === pendingKey && value === 'fr') {
      started.resolve()
      await release.promise
    }
    values.set(key, value)
  }
  const first = helper.changeOrganizationLanguage('fr')
  await started.promise
  const newest = helper.changeOrganizationLanguage('de')
  release.resolve()
  await Promise.all([first, newest])
  expect(i18n.resolvedLanguage).toBe('de')
  expect(values.get('language')).toBe('de')
  expect(values.get(pendingKey)).toBe('de')
})

it('allows a later preference after a failed storage write', async () => {
  const { i18n, values, storage, helper } = await setupStorageRace()
  storage.setItem = async (key, value) => {
    if (value === 'fr') throw new Error('storage unavailable')
    values.set(key, value)
  }
  await expect(helper.changeOrganizationLanguage('fr')).rejects.toThrow('storage unavailable')
  await helper.changeOrganizationLanguage('de')
  expect(i18n.resolvedLanguage).toBe('de')
  expect(values.get('language')).toBe('de')
})
