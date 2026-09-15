/**
 * The canonical envoy-ts-auth configuration every NETIX app shares. Seven apps used to carry
 * hand-maintained copies of these constants; this module is the single source of truth.
 *
 * Everything derives from the one deploy input, the base domain: universal-login is served at
 * the domain root, the launchpad at `launchpad.<domain>`, and the session cookie is scoped to
 * the bare domain so every `<app>.<domain>` shares it. Local dev scopes the session to whichever
 * page the dev server is opened on instead — localhost, 127.0.0.1 or a VM address over plain
 * http — with auth riding the app's `/user-api` dev proxy against real staging.
 *
 * The factory is pure — apps inject their `import.meta.env` reads and window facts — so it
 * stays safe for CJS/react-native builds and deterministic under test.
 */

export const TOKEN_ENDPOINT = '/auth/token/'
export const REFRESH_ENDPOINT = '/auth/token/refresh/'
export const VERIFY_ENDPOINT = '/auth/token/verify/'

// Cookie TTLs match the JWTs they carry: TOKEN_LIFETIME_MINS 720, REFRESH_LIFETIME_DAYS 2.
export const COOKIE_TOKEN_TTL = '43200'
export const COOKIE_REFRESH_TTL = '172800'
/**
 * The deployed value: `Secure; SameSite=None`, shared across the fleet over https. Dev passes
 * `false` instead (see `buildAuthConfig`): a browser stores a `Secure` cookie only in a secure
 * context, so a dev server opened at a VM address over plain http could never keep one, and
 * nothing in dev needs one — the token is read back by JavaScript and sent as a bearer.
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
  /**
   * `ENV.isDev`: a plain host-only session cookie on the page the dev server is opened on,
   * instead of the fleet-wide `Secure` cookie on `baseDomain`. Needs envoy-ts-auth ≥ 2.0.2,
   * which writes `SameSite=Lax` for `COOKIE_SECURE: false`.
   */
  dev?: boolean
  /**
   * `window.location.hostname`. Deployed: the app's own domain, for the redirect allowlist.
   * Dev: the page host — localhost, 127.0.0.1 or a VM address such as 10.0.0.1 — which
   * envoy-ts-auth validates the config against; defaults to localhost.
   */
  hostname?: string
  /** Local dev: open the dev sign-in prompt instead of navigating to universal-login. */
  onLogout?: () => void
  /** Local dev: suppress the post-login launchpad redirect (the prompt handles success). */
  onLogin?: () => void
  /**
   * Opt in when the app is deployed more than one level under `baseDomain` (`app.nano.<domain>`).
   * envoy-ts-auth's `validateAuthConfig` rejects a `CURRENT_APP_DOMAIN` that is not `BASE_DOMAIN`
   * or exactly one level below it, so a two-level host has to narrow `BASE_DOMAIN` to its own
   * parent — which is also the right `?continue=` allowlist root. `COOKIE_DOMAIN` deliberately
   * stays on `baseDomain`: that is what shares the session with every other NETIX frontend.
   * Off by default, so existing callers are unaffected.
   */
  narrowBaseDomain?: boolean
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

/** The app's own parent domain, when that still sits under `baseDomain`; otherwise `baseDomain`. */
function appBaseDomain(hostname: string, baseDomain: string): string {
  const parent = hostname.split('.').slice(1).join('.')
  return parent.endsWith(baseDomain) && parent !== baseDomain ? parent : baseDomain
}

/** The AUTH_CONFIG object envoy-ts-auth expects, fully derived from the base domain. */
export function buildAuthConfig({
  baseDomain,
  authBaseUrl,
  dev = false,
  hostname = '',
  onLogin,
  onLogout,
  narrowBaseDomain = false,
}: BuildAuthConfigOptions): AuthConfig {
  // Only consulted for a deployed build: dev scopes BASE_DOMAIN to the page host below.
  const redirectRoot = narrowBaseDomain ? appBaseDomain(hostname, baseDomain) : baseDomain
  // Dev: the session belongs to whatever page the dev server is opened on. Neither domain nor
  // the redirect allowlist drives a navigation there (the ON_LOGIN / ON_LOGOUT hooks do), but
  // envoy-ts-auth validates that BASE_DOMAIN and CURRENT_APP_DOMAIN agree.
  const devHost = hostname || 'localhost'
  return {
    COOKIE_TOKEN_TTL,
    COOKIE_REFRESH_TTL,
    COOKIE_SECURE: dev ? false : COOKIE_SECURE,
    // Deployed: the bare domain covers every subdomain (RFC 6265), which is what shares the
    // session. Dev: no Domain attribute at all — a host-only cookie, valid on an IP literal
    // too, where a browser would drop `Domain=localhost`.
    COOKIE_DOMAIN: dev ? '' : baseDomain,
    LOGIN_PAGE_URL: `https://${baseDomain}/`,
    AUTH_BASE_URL: authBaseUrl,
    LAUNCHPAD_PAGE_URL: `https://launchpad.${baseDomain}/`,
    BASE_DOMAIN: dev ? devHost : redirectRoot,
    CURRENT_APP_DOMAIN: dev ? devHost : hostname,
    TOKEN_ENDPOINT,
    REFRESH_ENDPOINT,
    VERIFY_ENDPOINT,
    ON_LOGIN: onLogin,
    ON_LOGOUT: onLogout,
  }
}
