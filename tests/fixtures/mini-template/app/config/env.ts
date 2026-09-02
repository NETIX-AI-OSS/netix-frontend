/**
 * Centralized runtime configuration — the only place `import.meta.env` is read.
 *
 * A deployment is described by one input, VITE_BASE_DOMAIN (netixai.dev for
 * staging, netixai.com for production, a customer domain for white-label
 * installs); every URL derives from it here. `.env` carries only that input and
 * genuine secrets — never per-service URLs.
 *
 * Under `vite dev` every backend is reached through the dev-server proxy at a
 * same-origin `/<service>-api` prefix, so development runs against the real
 * staging APIs with no CORS involved. Where each prefix points is the
 * `devUpstreams` map in vite.config.ts; nothing here changes when you retarget
 * one, because the app only ever calls the prefix.
 */

type EnvInputs = Pick<ImportMetaEnv, 'DEV' | 'VITE_BASE_DOMAIN' | 'VITE_SENTRY_DSN'>

/** Pure factory so tests can inject `import.meta.env` instead of stubbing it. */
export function buildEnv(meta: EnvInputs) {
  const isDev = meta.DEV
  const baseDomain = meta.VITE_BASE_DOMAIN

  if (!isDev && !baseDomain) {
    throw new Error('VITE_BASE_DOMAIN is missing; a production build cannot derive its API URLs')
  }

  /** The service's public URL — or its same-origin dev-proxy prefix under `vite dev`. */
  const serviceUrl = (subdomain: string, devProxyPath: string) =>
    isDev ? devProxyPath : `https://${subdomain}.${baseDomain}`

  return {
    isDev,
    baseDomain,

    /**
     * One entry per backend service this app talks to, written by
     * `netix init --services`. Each is `<name>Service: serviceUrl('<sub>.api',
     * '/<key>-api')` — the deployed URL in a build, the dev proxy prefix locally.
     */
    api: {},

    /**
     * The user service (auth, /auth/me/, organization locale). `auth-init.ts`
     * passes this as `authBaseUrl` to `buildAuthConfig`, so dev auth rides the
     * same-origin proxy and stores real staging tokens.
     */
    authBaseUrl: serviceUrl('user.api', '/user-api'),

    /** Unset in dev so local errors never reach the fleet's error tracker. */
    sentryDsn: isDev ? undefined : meta.VITE_SENTRY_DSN,
  } as const
}

export const ENV = buildEnv(import.meta.env)

export type Env = ReturnType<typeof buildEnv>
