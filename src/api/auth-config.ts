/**
 * The canonical envoy-ts-auth configuration every NETIX app shares. Seven apps used to carry
 * hand-maintained copies of these constants; this module is the single source of truth.
 *
 * Everything derives from the one deploy input, the base domain: universal-login is served at
 * the domain root, the launchpad at `launchpad.<domain>`, and the session cookie is scoped to
 * the bare domain so every `<app>.<domain>` shares it. Local dev keeps the same shape scoped
 * to localhost, with auth riding the app's `/user-api` dev proxy against real staging.
 *
 * The factory is pure — apps inject their `import.meta.env` reads and window facts — so it
 * stays safe for CJS/react-native builds and deterministic under test.
 */

export const TOKEN_ENDPOINT = '/auth/token/'
export const REFRESH_ENDPOINT = '/auth/token/refresh/'
export const VERIFY_ENDPOINT = '/auth/token/verify/'

export const COOKIE_TOKEN_TTL = '300'
export const COOKIE_REFRESH_TTL = '172800'
/**
 * True even on http://localhost: envoy-ts-auth stamps every cookie `SameSite=None`, which
 * browsers only accept together with `Secure`. Chrome and Firefox treat localhost as a secure
 * context so the pair works in dev; Safari does not and silently drops the cookie — local
 * development is Chrome/Firefox.
 */
export const COOKIE_SECURE = true

export type BuildAuthConfigOptions = {
  /** The one deploy input every URL derives from (`ENV.baseDomain`). */
  baseDomain: string
  /**
   * `ENV.authBaseUrl` — the same-origin `/user-api` dev-proxy prefix under `vite dev` (real
   * staging auth, no CORS), `https://user.api.<domain>` in a build.
   */
  authBaseUrl: string
  /** `ENV.isDev`: scopes the cookie and the redirect allowlist to localhost. */
  dev?: boolean
  /** `window.location.hostname` — the deployed app's own domain, for the redirect allowlist. */
  hostname?: string
  /** Local dev: open the dev sign-in prompt instead of navigating to universal-login. */
  onLogout?: () => void
  /** Local dev: suppress the post-login launchpad redirect (the prompt handles success). */
  onLogin?: () => void
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
  ON_LOGIN?: () => void
  ON_LOGOUT?: () => void
}

/** The AUTH_CONFIG object envoy-ts-auth expects, fully derived from the base domain. */
export function buildAuthConfig({
  baseDomain,
  authBaseUrl,
  dev = false,
  hostname = '',
  onLogin,
  onLogout,
}: BuildAuthConfigOptions): AuthConfig {
  return {
    COOKIE_TOKEN_TTL,
    COOKIE_REFRESH_TTL,
    COOKIE_SECURE,
    // The bare domain covers every subdomain (RFC 6265), which is what shares the session.
    COOKIE_DOMAIN: dev ? 'localhost' : baseDomain,
    LOGIN_PAGE_URL: `https://${baseDomain}/`,
    AUTH_BASE_URL: authBaseUrl,
    LAUNCHPAD_PAGE_URL: `https://launchpad.${baseDomain}/`,
    BASE_DOMAIN: dev ? 'localhost' : baseDomain,
    CURRENT_APP_DOMAIN: dev ? 'localhost' : hostname,
    TOKEN_ENDPOINT,
    REFRESH_ENDPOINT,
    VERIFY_ENDPOINT,
    ON_LOGIN: onLogin,
    ON_LOGOUT: onLogout,
  }
}
