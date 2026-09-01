/**
 * The canonical envoy-ts-auth configuration every NETIX app shares. Seven apps used to carry
 * hand-maintained copies of these constants; this module is the single source of truth.
 *
 * The factory is pure — apps inject their `import.meta.env` reads and window facts — so it
 * stays safe for CJS/react-native builds and deterministic under test.
 */

export const TOKEN_ENDPOINT = '/auth/token/'
export const REFRESH_ENDPOINT = '/auth/token/refresh/'
export const VERIFY_ENDPOINT = '/auth/token/verify/'

export const COOKIE_TOKEN_TTL = '300'
export const COOKIE_REFRESH_TTL = '172800'
export const COOKIE_SECURE = true

/** Where the auth service listens in local development. */
export const DEV_AUTH_BASE_URL = 'http://localhost:8001'

/** The app's env-derived inputs, usually straight from `import.meta.env.VITE_*`. */
export type AuthConfigEnv = {
  loginPageUrl?: string
  authBaseUrl?: string
  cookieDomain?: string
  launchpadPageUrl?: string
  baseDomain?: string
}

export type BuildAuthConfigOptions = {
  /** `import.meta.env.VITE_DEV_MODE === 'true'` in the donor apps. */
  devMode?: boolean
  /** `window.location.origin`; the dev fallback for the login and launchpad pages. */
  origin?: string
  /** `window.location.hostname`; the dev fallback for the base domain. */
  hostname?: string
  /** Override for non-standard local auth ports. */
  devAuthBaseUrl?: string
  env?: AuthConfigEnv
}

export type AuthConfig = {
  COOKIE_TOKEN_TTL: string
  COOKIE_REFRESH_TTL: string
  COOKIE_SECURE: boolean
  COOKIE_DOMAIN: string
  LOGIN_PAGE_URL: string
  AUTH_BASE_URL: string
  LAUNCHPAD_PAGE_URL: string
  BASE_DOMAIN: string
  CURRENT_APP_DOMAIN: string
  TOKEN_ENDPOINT: string
  REFRESH_ENDPOINT: string
  VERIFY_ENDPOINT: string
}

/** The AUTH_CONFIG object envoy-ts-auth expects, with the fleet's dev-mode switches applied. */
export function buildAuthConfig({
  devMode = false,
  origin = '',
  hostname = '',
  devAuthBaseUrl = DEV_AUTH_BASE_URL,
  env = {},
}: BuildAuthConfigOptions = {}): AuthConfig {
  return {
    COOKIE_TOKEN_TTL,
    COOKIE_REFRESH_TTL,
    COOKIE_SECURE,
    COOKIE_DOMAIN: devMode ? 'localhost' : (env.cookieDomain ?? ''),
    LOGIN_PAGE_URL: devMode ? origin : (env.loginPageUrl ?? ''),
    AUTH_BASE_URL: devMode ? devAuthBaseUrl : (env.authBaseUrl ?? ''),
    LAUNCHPAD_PAGE_URL: devMode ? origin : (env.launchpadPageUrl ?? ''),
    BASE_DOMAIN: devMode ? hostname : (env.baseDomain ?? ''),
    CURRENT_APP_DOMAIN: hostname,
    TOKEN_ENDPOINT,
    REFRESH_ENDPOINT,
    VERIFY_ENDPOINT,
  }
}
