import {
  buildAuthConfig,
  COOKIE_REFRESH_TTL,
  COOKIE_TOKEN_TTL,
  DEV_AUTH_BASE_URL,
  REFRESH_ENDPOINT,
  TOKEN_ENDPOINT,
  VERIFY_ENDPOINT,
} from './auth-config'

const env = {
  loginPageUrl: 'https://netixai.dev/',
  authBaseUrl: 'https://user.api.netixai.dev',
  cookieDomain: '.netixai.dev',
  launchpadPageUrl: 'https://launchpad.netixai.dev',
  baseDomain: 'netixai.dev',
}

it('pins the fleet constants the seven app copies drifted around', () => {
  expect(COOKIE_TOKEN_TTL).toBe('300')
  expect(COOKIE_REFRESH_TTL).toBe('172800')
  expect(TOKEN_ENDPOINT).toBe('/auth/token/')
  expect(REFRESH_ENDPOINT).toBe('/auth/token/refresh/')
  expect(VERIFY_ENDPOINT).toBe('/auth/token/verify/')
})

it('passes the env straight through in deployed mode', () => {
  const config = buildAuthConfig({ hostname: 'cafm.netixai.dev', env })
  expect(config).toMatchObject({
    COOKIE_DOMAIN: '.netixai.dev',
    LOGIN_PAGE_URL: 'https://netixai.dev/',
    AUTH_BASE_URL: 'https://user.api.netixai.dev',
    LAUNCHPAD_PAGE_URL: 'https://launchpad.netixai.dev',
    BASE_DOMAIN: 'netixai.dev',
    CURRENT_APP_DOMAIN: 'cafm.netixai.dev',
    COOKIE_SECURE: true,
  })
})

it('switches to the local endpoints in dev mode', () => {
  const config = buildAuthConfig({
    devMode: true,
    origin: 'http://localhost:5173',
    hostname: 'localhost',
    env,
  })
  expect(config).toMatchObject({
    COOKIE_DOMAIN: 'localhost',
    LOGIN_PAGE_URL: 'http://localhost:5173',
    AUTH_BASE_URL: DEV_AUTH_BASE_URL,
    LAUNCHPAD_PAGE_URL: 'http://localhost:5173',
    BASE_DOMAIN: 'localhost',
    CURRENT_APP_DOMAIN: 'localhost',
  })
})

it('honours a non-standard local auth port', () => {
  const config = buildAuthConfig({ devMode: true, devAuthBaseUrl: 'http://localhost:9001' })
  expect(config.AUTH_BASE_URL).toBe('http://localhost:9001')
})

it('degrades to empty strings when env vars are missing', () => {
  expect(buildAuthConfig()).toMatchObject({
    COOKIE_DOMAIN: '',
    LOGIN_PAGE_URL: '',
    AUTH_BASE_URL: '',
    LAUNCHPAD_PAGE_URL: '',
    BASE_DOMAIN: '',
    CURRENT_APP_DOMAIN: '',
  })
})
