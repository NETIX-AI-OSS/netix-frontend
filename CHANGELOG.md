# Changelog

## v1.0.2 — 2026-08-26

Fleet-wave feedback patch (viz-ui adoption).

- api: transport retry no longer retries 5xx by default — no donor app family did, and it flipped
  one-shot-error test mocks into false successes. Opt back in with `retry: { retryServerErrors: true }`.
- ui: `netix-frontend/ui/theme` deep entry so ThemeProvider/useTheme are reachable without the
  barrel (which forces every optional peer to resolve).

## v1.0.1 — 2026-08-25

Pilot-feedback patch (frontend-template + value-nano-ui adoptions).

- ui: every primitive and composite is also its own entry point (`netix-frontend/ui/<name>`), so apps without an optional peer never resolve it.
- ui: `ui/styles-notokens.css` — component classes only, for v4 apps that already import `tokens/tokens.css`.
- api: canceled requests pass through `createErrorInterceptor` untouched and are never retried by the SWR/react-query policies.
- tokens: `theme-init.js` honours `data-theme-key` / `data-default-theme` on `<html>`; `themeInitSnippet` export for single-file builds; `tokens/theme-only.css` compile-time contract.
- i18n: optional `LocaleRuntimeLike.checkHealth` + `healthGate`; `organization_default_language` joins the boot precedence.
- utils: `formatCurrency`.

## v1.0.0 — 2026-08-25

First release: the fleet's shared code coalesced into one AGPL package with committed `dist/`.

- **api** — `createHttpClient` + orval `createMutator`; one `ApiError` (`statusCode`, `messages[]`,
  `retryAfterMs`, plus `status`/`errorMessage` compat aliases); envelope parser normalizing every
  fleet `messages` shape; throwing error interceptor (403 in-app, 401 no-op with `onAuthError` hook);
  idempotent-only retry with Retry-After; swr/react-query retry policies; Sentry beforeSend chain;
  dev-token manager.
- **hooks** — prop-driven `useFilters`/`usePagination`/`useTabs`/`useTimeRange`,
  `useIsMobile`, `useResizeObserver`, `useDelayedLoading`, fail-closed `usePermissions` +
  `PermissionGate`; react-router bindings under the separate `hooks/router` entry.
- **utils** — bundled `cn`; the fleet date module on a private date-fns-shaped kernel (four
  technician-app date bugs fixed, typo alias kept deprecated); formatters; collection helpers;
  `STATUS_COLORS`. DOM-only download/upload and `lazyWithRetry` under `utils/dom`.
- **i18n** — `createI18n` bootstrap, org-locale runtime (+ `clearActiveIdentity`), shared `common`
  namespace (en/ar/es).
- **ui** — 33 Gen-B shadcn primitives (viz dialog guard, scoped `useFormState`, typography h1 fix)
  and tier-2 composites: react-table v9 `DataTable` stack, combobox pair, `TreeView`, RHF form glue,
  modals, `Toaster`, `LoadingState`; `ThemeProvider` + pre-paint theme-init under the single
  `netix-theme` key; one precompiled `ui/styles.css`.
- **tokens** — `netix.tokens.json` → generated `tokens.css` (v4 `@theme`), v3 `preset`, `vars.css`,
  `theme-init.js`, typed JS access; brand re-anchored on `#196796`; Okabe–Ito chart ramp; Archivo
  woff2 faces shipped from the package.
- **presets** — shared eslint (base + strict), tsconfig, prettier.

Known deliberate deltas for adopters are listed per-PR; the headline ones: Sentry drops 400/403/404
by default, retry families converge, brand hue/radius shift in viz/prism, theme storage key resets
once, swr retry count is exactly 3.
