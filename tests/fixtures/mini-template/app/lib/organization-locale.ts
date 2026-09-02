import { createBrowserLocaleStorage, LocaleRuntime } from 'envoy-ts-auth'
import {
  createOrganizationLocale,
  localeIdentity,
  type LocaleUser,
  type OrganizationLocale,
} from 'netix-frontend/i18n'

import { ENV } from '@/config/env'
import { getAccessToken } from '@/lib/auth'
import i18n from '@/lib/i18n'

const AUTH_BASE_URL = ENV.authBaseUrl
let coordinator: OrganizationLocale | null = null

function getCoordinator(): OrganizationLocale | null {
  if (typeof window === 'undefined') return null
  if (!coordinator) {
    const storage = createBrowserLocaleStorage(window.localStorage)
    coordinator = createOrganizationLocale({
      i18n,
      storage,
      createRuntime: (apiBaseUrl) =>
        new LocaleRuntime({
          apiBaseUrl,
          application: 'frontend-template',
          storage,
          getAccessToken,
        }),
      getApiBaseUrl: () => AUTH_BASE_URL,
      healthGate: true,
    })
  }
  return coordinator
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  return asRecord(record.user) ?? record
}

async function fetchMe(): Promise<LocaleUser | null> {
  const token = await getAccessToken()
  const headers: HeadersInit = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${AUTH_BASE_URL.replace(/\/$/, '')}/auth/me/`, {
    credentials: 'include',
    headers,
  })
  if (!response.ok) return null
  return asRecord(await response.json()) as LocaleUser | null
}

/** Template startup reference: health -> identity -> cached bundle -> one ETag refresh. */
export async function initializeOrganizationLocale(): Promise<void> {
  const locale = getCoordinator()
  // checkHealth is part of LocaleRuntimeLike itself now, so no cast back to
  // envoy-ts-auth's concrete runtime is needed. `healthGate: true` above also
  // makes refreshOrganizationLocale gate on it internally; checking here too
  // skips the /auth/me/ fetch entirely when the locale API is down.
  const runtime = locale?.getLocaleRuntime()
  const healthy = (await runtime?.checkHealth?.()) ?? true
  if (!locale || !runtime || !healthy) return
  try {
    const user = await fetchMe()
    if (!user || !localeIdentity(user)) {
      locale.clearActiveIdentity()
      return
    }
    await locale.refreshOrganizationLocale(user)
  } catch (error) {
    console.warn(
      'Unable to refresh organization terminology; bundled locale remains active.',
      error,
    )
  }
}

export async function selectOrganizationLanguage(language: string): Promise<void> {
  await getCoordinator()?.changeOrganizationLanguage(language)
}
