// src/api/auth-config.ts
var TOKEN_ENDPOINT = "/auth/token/";
var REFRESH_ENDPOINT = "/auth/token/refresh/";
var VERIFY_ENDPOINT = "/auth/token/verify/";
var COOKIE_TOKEN_TTL = "43200";
var COOKIE_REFRESH_TTL = "172800";
var COOKIE_SECURE = true;
function appBaseDomain(hostname, baseDomain) {
  const parent = hostname.split(".").slice(1).join(".");
  return parent.endsWith(baseDomain) && parent !== baseDomain ? parent : baseDomain;
}
function buildAuthConfig({
  baseDomain,
  authBaseUrl,
  dev = false,
  hostname = "",
  onLogin,
  onLogout,
  narrowBaseDomain = false
}) {
  const redirectRoot = narrowBaseDomain ? appBaseDomain(hostname, baseDomain) : baseDomain;
  const devHost = hostname || "localhost";
  return {
    COOKIE_TOKEN_TTL,
    COOKIE_REFRESH_TTL,
    COOKIE_SECURE: dev ? false : COOKIE_SECURE,
    // Deployed: the bare domain covers every subdomain (RFC 6265), which is what shares the
    // session. Dev: no Domain attribute at all — a host-only cookie, valid on an IP literal
    // too, where a browser would drop `Domain=localhost`.
    COOKIE_DOMAIN: dev ? "" : baseDomain,
    LOGIN_PAGE_URL: `https://${baseDomain}/`,
    AUTH_BASE_URL: authBaseUrl,
    // The launcher lives on universal-login's root page, shown there once signed in.
    LAUNCHPAD_PAGE_URL: `https://${baseDomain}/`,
    BASE_DOMAIN: dev ? devHost : redirectRoot,
    CURRENT_APP_DOMAIN: dev ? devHost : hostname,
    TOKEN_ENDPOINT,
    REFRESH_ENDPOINT,
    VERIFY_ENDPOINT,
    ON_LOGIN: onLogin,
    ON_LOGOUT: onLogout
  };
}

export { COOKIE_REFRESH_TTL, COOKIE_SECURE, COOKIE_TOKEN_TTL, REFRESH_ENDPOINT, TOKEN_ENDPOINT, VERIFY_ENDPOINT, buildAuthConfig };
