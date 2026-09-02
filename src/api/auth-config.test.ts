import {
  buildAuthConfig,
  COOKIE_REFRESH_TTL,
  COOKIE_TOKEN_TTL,
  REFRESH_ENDPOINT,
  TOKEN_ENDPOINT,
  VERIFY_ENDPOINT,
} from './auth-config'

it('pins the fleet constants the seven app copies drifted around', () => {
  expect(COOKIE_TOKEN_TTL).toBe('300')
  expect(COOKIE_REFRESH_TTL).toBe('172800')
  expect(TOKEN_ENDPOINT).toBe('/auth/token/')
  expect(REFRESH_ENDPOINT).toBe('/auth/token/refresh/')
  expect(VERIFY_ENDPOINT).toBe('/auth/token/verify/')
})

it('derives the whole deployed config from the base domain', () => {
  const config = buildAuthConfig({
    baseDomain: 'netixai.dev',
    authBaseUrl: 'https://user.api.netixai.dev',
    hostname: 'cafm.netixai.dev',
  })
  expect(config).toMatchObject({
    COOKIE_DOMAIN: 'netixai.dev',
    LOGIN_PAGE_URL: 'https://netixai.dev/',
    AUTH_BASE_URL: 'https://user.api.netixai.dev',
    LAUNCHPAD_PAGE_URL: 'https://launchpad.netixai.dev/',
    BASE_DOMAIN: 'netixai.dev',
    CURRENT_APP_DOMAIN: 'cafm.netixai.dev',
    COOKIE_SECURE: true,
  })
  expect(config.ON_LOGIN).toBeUndefined()
  expect(config.ON_LOGOUT).toBeUndefined()
})

it('scopes cookies and the redirect allowlist to localhost in dev, riding the proxy', () => {
  const config = buildAuthConfig({
    baseDomain: 'netixai.dev',
    authBaseUrl: '/user-api',
    dev: true,
    hostname: 'localhost',
  })
  expect(config).toMatchObject({
    COOKIE_DOMAIN: 'localhost',
    AUTH_BASE_URL: '/user-api',
    BASE_DOMAIN: 'localhost',
    CURRENT_APP_DOMAIN: 'localhost',
    // SameSite=None (hard-coded in envoy-ts-auth) requires Secure even on localhost.
    COOKIE_SECURE: true,
    // Derived but unused in dev: the hooks replace both navigations.
    LOGIN_PAGE_URL: 'https://netixai.dev/',
    LAUNCHPAD_PAGE_URL: 'https://launchpad.netixai.dev/',
  })
})

it('passes the dev sign-in prompt hooks through to envoy-ts-auth', () => {
  const onLogin = () => {}
  const onLogout = () => {}
  const config = buildAuthConfig({
    baseDomain: 'netixai.dev',
    authBaseUrl: '/user-api',
    dev: true,
    onLogin,
    onLogout,
  })
  expect(config.ON_LOGIN).toBe(onLogin)
  expect(config.ON_LOGOUT).toBe(onLogout)
  // hostname is irrelevant in dev; the allowlist is localhost either way.
  expect(config.CURRENT_APP_DOMAIN).toBe('localhost')
})
