import { describe, expect, it } from 'vitest'
import { buildEnv } from './env'

const inputs = { VITE_BASE_DOMAIN: 'acme.dev', VITE_SENTRY_DSN: 'dsn' }

describe('buildEnv', () => {
  // Asserted over ENV.api as a whole so these stay true whichever services this
  // app wires — adding one to env.ts never needs a matching edit here.
  it('derives every api url from the base domain', () => {
    const env = buildEnv({ DEV: false, ...inputs })
    for (const url of Object.values(env.api))
      expect(url).toMatch(/^https:\/\/[a-z0-9.-]+\.acme\.dev$/)
    expect(env.authBaseUrl).toBe('https://user.api.acme.dev')
    expect(env.sentryDsn).toBe('dsn')
    expect(env.isDev).toBe(false)
  })

  it('routes every api through a same-origin proxy prefix in dev', () => {
    const env = buildEnv({ DEV: true, ...inputs })
    for (const url of Object.values(env.api)) expect(url).toMatch(/^\/[a-z0-9-]+-api$/)
    expect(env.authBaseUrl).toBe('/user-api')
    expect(env.sentryDsn).toBeUndefined()
  })

  it('refuses a production build without a base domain', () => {
    expect(() => buildEnv({ DEV: false, VITE_BASE_DOMAIN: '', VITE_SENTRY_DSN: '' })).toThrow(
      'VITE_BASE_DOMAIN',
    )
  })
})
