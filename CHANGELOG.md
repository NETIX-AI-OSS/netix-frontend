# Changelog

## v2.0.0 — 2026-09-01

The platform release: the library shrinks to the contract that must never drift per-app, and
everything component-shaped moves to a copy-in registry. Apps pinned to v1 tags are unaffected
until they bump; the migration table lives in `docs/design-system/migration-guide.md`.

Breaking:

- Removed exports: `./hooks`, `./hooks/router`, `./ui`, `./ui/*`, `./ui/styles.css`,
  `./ui/styles-notokens.css`, `./ui/theme`. Hooks and composites now install from the @netix
  registry (`shadcn add @netix/<item>`); primitives come from the official shadcn registry
  (base-nova). ThemeProvider moved to the new `./theme` entry.
- Nova token migration: the token set is the frontend-template design foundation —
  `--primary`/`--tint`/`--typeface-*`/`--type-*-size`/`--space-*`/`--status-*`
  (success/warning/danger/info/neutral × base/foreground/surface/border)/`--chart-*` ramps.
  The `--brand-*` scale, the 8×5 status ladder, elevation/motion shorthands, density switch and
  Inter references are gone. `statusColor()` speaks the Nova names and slots.
- No precompiled component CSS: `dist/ui/*` no longer exists, and Tailwind v3 apps no longer
  scan this package's dist in `content` globs. The new `./styles.css` is a Tailwind v4 SOURCE
  (tailwindcss + tokens + vendored shadcn variants sheet + enter/exit animation utilities +
  app-shell base) compiled by the consuming app.
- `src/utils` no longer exports the legacy `STATUS_COLORS` hexes.
- peerDependencies pruned to the surviving surface: all `@radix-ui/*`, `@tanstack/react-table`,
  `react-hook-form`, `react-router`, `sonner` and `lucide-react` peers are gone (registry items
  declare them per-item instead).

Added:

- `netix` CLI (`bin`, zero runtime deps): `init` scaffolds from frontend-template with
  interactive service selection, per-service client/orval/env fanout, gh-based schema pull,
  install/codegen/git post-steps; `add` wraps the pinned shadcn CLI for @netix items;
  `schema pull` refreshes OpenAPI specs per `services.json` (new root manifest, also exported).
- The @netix shadcn registry: sources under `registry/netix/`, built to committed `r/`,
  served from raw.githubusercontent by tag. Hooks and composites ported to the base-nova
  Base UI primitives; app-shell blocks snapshot the template.
- `./theme` (dataset-aware ThemeProvider), `./styles.css`, `./tokens.css`, `./theme-init.js`,
  `./services.json` exports.
- `api`: canonical auth config (`buildAuthConfig`, `COOKIE_TOKEN_TTL`, endpoint constants) —
  replaces seven drifted per-app `authConfig.ts` copies.
- Date kernel helpers promoted to the public `utils` surface (`startOfDay`, `endOfDay`,
  `startOfHour`, `startOfMonth`, `subDays`, `subHours`).

## v1.0.2 — 2026-08-26

Fleet-wave feedback patch (viz-ui adoption).

- api: transport retry no longer retries 5xx by default. Several donors did retry 5xx (viz, cafm,
  asset, template, prism, technician) — those apps pass `retry: { retryServerErrors: true }` to keep
  their behavior; the conservative default protects the apps whose transports never retried 5xx and
  keeps one-shot-error test mocks honest.
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
