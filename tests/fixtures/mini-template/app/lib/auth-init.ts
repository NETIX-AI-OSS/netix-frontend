/**
 * envoy-ts-auth bootstrap — imported first in main.tsx, before anything fetches.
 *
 * Deployed: an unauthenticated visit redirects to universal-login on the base
 * domain and returns via ?continue=; every `<app>.<baseDomain>` shares the
 * session cookie. Local dev: ON_LOGOUT opens the headless dev sign-in prompt
 * instead, which stores real staging tokens as localhost cookies, so `vite dev`
 * talks to staging as a real user (Chrome/Firefox — Safari drops the
 * SameSite=None cookie on http://localhost).
 */
import { Auth } from 'envoy-ts-auth'
import { buildAuthConfig, createDevLoginPrompt } from 'netix-frontend/api'

import { ENV } from '@/config/env'

const devLogin = ENV.isDev
  ? createDevLoginPrompt({
      login: (username, password) => Auth.getInstance().login(username, password),
    })
  : undefined

// HMR re-evaluates this module; reset so initialize does not throw on the second pass.
if (ENV.isDev) Auth.reset()

Auth.initialize(
  buildAuthConfig({
    baseDomain: ENV.baseDomain,
    authBaseUrl: ENV.authBaseUrl,
    dev: ENV.isDev,
    hostname: window.location.hostname,
    onLogout: devLogin?.open,
    onLogin: devLogin?.close,
  }),
)

// envoy-ts-auth only fires ON_LOGOUT on 401/403 responses it sees; a fresh visit with no
// cookies at all clears silently instead (and /auth/me/ answers anonymous requests with a
// 403 it also swallows). This eager check closes the gap: no session → the dev sign-in
// prompt locally, the universal-login redirect deployed.
void Auth.getInstance()
  .getUser()
  .catch(() => null)
  .then((user) => {
    if (!user) Auth.getInstance().redirectToLoginPage()
  })
