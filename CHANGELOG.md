# Changelog

## v2.0.3 — 2026-09-04

Bug-fix patch (organisation locale replacing the bundled catalogue).

- i18n (fixed): `applyEffectiveLocale` merges the organisation's effective locale over the app's
  bundled catalogue instead of replacing it. Server values win per key; bundled text is the floor
  for keys the server catalogue does not carry yet (e.g. keys added in a design-system merge the
  backend has not caught up on); a key dropped server-side reverts to its bundled value on the next
  refresh instead of keeping the stale server value. Forward-port of the v1.0.3 fix (#5) onto v2.
- CLI: `LIB_REF` → `v2.0.3` so `netix init` scaffolds new apps on this release (with the locale
  fix); `TEMPLATE_REF` → `v1.0.1` for the matching frontend-template tag. `REGISTRY_REF` stays
  `v2.0.1` — the `r/` registry is byte-identical.

## v2.0.2 — 2026-09-03

Makes the `netix` CLI work when installed. Every released copy of it was inert: the bin entry
guarded on `process.argv[1]?.endsWith('cli/index.js')`, but npm installs the bin as a symlink at
`node_modules/.bin/netix`, so the guard was false and the process exited 0 having printed
nothing. `npx github:NETIX-AI-OSS/netix-frontend#v2.0.1 init my-app` did nothing at all.

- `src/cli/index.ts`: the entry check resolves `process.argv[1]` through `realpathSync` and
  compares it to `import.meta.url`, so it holds for a direct `node dist/cli/index.js`, for the
  `.bin` symlink and for a global install. Covered by unit tests and by one that spawns the
  built bin through a symlink, which is the case that was missing.
- `LIB_REF` and `REGISTRY_REF` deliberately stay at `v2.0.1`. The importable surface and `r/`
  are byte-identical at both tags, and holding them keeps a scaffold's lockfile matching the
  template's exactly instead of re-resolving on first install.

## v2.0.1 — 2026-09-03

Fixes the template ref `netix init` scaffolds from. v2.0.0 pinned `template-v2.0.0`, a tag that
never existed in `NETIX-AI/frontend-template`, so `init` failed at the template download with a 404. The template now carries ordinary semver tags and versions independently of this package
instead of mirroring its number behind a `template-` prefix.

- `src/cli/refs.ts`: `TEMPLATE_REF` is `v1.0.0`. `LIB_REF` and `REGISTRY_REF` move to `v2.0.1`
  so scaffolds inherit the release they were cut from. No registry, token or runtime change —
  `r/` and the importable surface are byte-identical to v2.0.0.

## v2.0.0 — 2026-09-03

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
- The fleet data layer standardizes on TanStack Query: the SWR retry helpers
  (`createSwrOnErrorRetry`, `computeSwrBackoffDelayMs`, `isRetryableSwrError`,
  `SWR_MAX_RETRIES`) are removed, `createQueryRetryPolicy` is the canonical policy, and
  CLI-scaffolded orval blocks generate `client: 'react-query'` hooks. `init` also writes a
  self-contained module page per selected service (`app/modules/<key>/` + one registry line —
  a paginated `@netix/data-table` over the service client; delete the folder and line to remove
  it). Each page opens on that service's `listEndpoint` from `services.json` — a real collection
  route, so a scaffolded module renders rows instead of a 404 on the service root. `init` and
  `service add` write pages whose columns are read from the service's OpenAPI spec — field
  names, order and per-type formatting (dates, booleans, numbers) come from the contract, so the
  table keeps its header row, widths and shape while the first page loads and when the collection
  comes back empty. Both commands pull schemas before writing the pages; with `--no-schemas` the
  page falls back to inferring columns from the first row and says so in a comment. The pages
  render the registry DataTable — column pinning, per-column
  filters, sized columns, skeleton/overlay loading and empty states — rather than a bare
  `ui/table`. frontend-template ships that component and its closure, so scaffolding stays
  offline: `netix init` never fetches from the registry. `pnpm sync:template <path>` refreshes
  the template's copies (and `sync:template:check` gates drift) as the first step of a release.
- The registry table stack moved off the `@tanstack/react-table/legacy` v8 compat adapter to the
  native TanStack Table **v9** API. `data-table`, `column-filter` and `pagination-controls` now
  take v9 types, and the new `@netix/table-features` item exports `dataTableFeatures`, the
  feature set they are all typed against — v9 types are feature-conditional and `TFeatures` is
  invariant, so the set is part of the contract. Consumers swap `useLegacyTable({ ...,
getCoreRowModel: getCoreRowModel() })` for `useTable({ features: dataTableFeatures, ... })`,
  `LegacyColumnDef<TData>` for `ColumnDef<typeof dataTableFeatures, TData>`, and
  `table.getState().pagination` for `table.state.pagination`. Apps that already copied these
  components keep their v8-adapter versions until they re-add them.

- peerDependencies pruned to the surviving surface: all `@radix-ui/*`, `@tanstack/react-table`,
  `react-hook-form`, `react-router`, `sonner` and `lucide-react` peers are gone (registry items
  declare them per-item instead).

Breaking (tokens):

- `--tint`/`--tint-foreground` are removed. Their values move to `--accent`/`--accent-foreground`,
  so menu highlight states use shadcn's own token name and the base-nova components need no
  rewrite to stay on-brand.
- The previous high-contrast `--accent` (near-black light / near-white dark) is renamed
  `--primary-2`/`--primary-2-foreground`. It backs the workspace sidebar's active nav item.
- Migration: replace `bg-tint`/`text-tint-foreground` with `bg-accent`/`text-accent-foreground`;
  anywhere you relied on `bg-accent` for a high-contrast inverted surface, switch to
  `bg-primary-2`/`text-primary-2-foreground`.

Added:

- `netix` CLI (`bin`, zero runtime deps): `init` scaffolds from frontend-template with
  interactive service selection, per-service client/orval/env fanout, gh-based schema pull,
  install/codegen post-steps, and the scaffold commit last — so the pulled schemas and
  `pnpm-lock.yaml` land inside it and a fresh app starts with a clean tree; the scaffold sets
  the base domain in the committed `.env` (tracked, like every deployed NETIX frontend — CI's
  bare `docker compose build` resolves the deploy inputs from it); `add` wraps the pinned
  shadcn CLI for @netix items; `service add` retrofits
  the same per-service wiring into an existing app (additive and idempotent — re-adding a
  wired service only refreshes its spec and client, app-owned files are never overwritten);
  `schema pull` refreshes OpenAPI specs per `services.json` (new root manifest, also
  exported) for one, some (comma- or space-separated) or every wired service — detected from
  `orval.config.ts`, so a service whose first pull failed is still found — and runs
  `pnpm generate:client` afterwards (`--no-generate` to skip).
- `services.json` covers every NETIX-AI backend with a public API (user, asset, cafm, data,
  gateway, ml-engine, notification, report, simulator, stormbreaker, tag, update, vision-ai,
  visualization), pinned to the canonical `NETIX-AI/*` repos — the old 4T5Labs org survives
  only as a GitHub redirect. The user service is no longer a choice: every app authenticates,
  so `init` always wires it — as a client only, never a module page (the template's access
  pages are its UI).
- The @netix shadcn registry: sources under `registry/netix/`, built to committed `r/`,
  served from raw.githubusercontent by tag. Hooks and composites ported to the base-nova
  Base UI primitives; the ten NETIX-customized canon primitives ship as `@netix/<name>`
  registry:ui items (composites depend on those, never on stock). The app shell
  (layout/sidebar/topbar/recipes/auth wiring) is template scaffolding, never a registry item.
- `./theme` (dataset-aware ThemeProvider), `./styles.css`, `./tokens.css`, `./theme-init.js`,
  `./services.json` exports.
- `api`: canonical auth config — `buildAuthConfig` derives the login page (universal-login at
  the domain root), launchpad, cookie scope and auth base URL from the one base-domain input,
  with `ON_LOGIN`/`ON_LOGOUT` passthrough — replacing seven drifted per-app `authConfig.ts`
  copies. `COOKIE_SECURE` stays true on localhost (envoy-ts-auth hard-codes `SameSite=None`,
  which browsers only accept with `Secure`; dev is Chrome/Firefox).
- `api`: `createDevLoginPrompt` — a headless `window.prompt`-based sign-in for local
  development that stores real staging tokens through the app's `/user-api` proxy via
  envoy-ts-auth's `ON_LOGOUT`/`ON_LOGIN` hooks; no login page, no UI, no credentials in
  `.env`. It supersedes the dev-token manager (`createDevTokenManager` and the `devTokens`
  client option are gone), and CLI-scaffolded service clients now pass the app's
  `getAccessToken` seam so requests carry the session bearer.
- Date kernel helpers promoted to the public `utils` surface (`startOfDay`, `endOfDay`,
  `startOfHour`, `startOfMonth`, `subDays`, `subHours`).

Added (tokens + theme):

- **Design styles.** The token layer now carries a second, shape-only axis alongside light/dark.
  `tokens/netix.tokens.json` gained a `styles` map whose entries generate `[data-style='<name>']`
  blocks in `tokens.css` and `vars.css`; the default style also answers to a bare `:root`, so an
  app that never sets the attribute is unaffected and a nested `[data-style]` can switch back.
  Two styles ship: **nova** (the existing look, byte-identical) and **rhea** (shadcn's Rhea —
  pill controls and softer panels; see `user-profile-ui` for the same aesthetic hand-rolled).
  A style re-points semantic _shape aliases_ only — never the palette, the radius scale or type:
  `--radius-control{,-sm,-xs}`, `--radius-field`, `--radius-surface`, `--radius-panel`, `--radius-item{,-sm}`,
  `--radius-indicator` and `--control-px{,-xs,-lg}`. The radius aliases are declared in `@theme`,
  so `rounded-control` / `rounded-surface` / `rounded-panel` / `rounded-item` exist as ordinary
  Tailwind utilities (corner and side variants included).
- `ThemeProvider` gained the second axis: `style` / `setStyle`, persisted under `netix-style`
  (`STYLE_STORAGE_KEY`) and applied as `data-style` on `<html>`, with `defaultStyle` /
  `styleStorageKey` props and `data-default-style` / `data-style-key` dataset defaults, mirroring
  the theme axis exactly. `STYLES` and the `Style` type are exported from `netix-frontend/theme`;
  `STYLE_NAMES` from `netix-frontend/tokens`. A stored value that is not a shipped style is
  ignored. `theme-init.js` applies the style before first paint, so there is no flash.
- Generated file: `src/tokens/style-names.ts` (added to the CI drift gate).

Changed (registry):

- Primitives and composites now express radius through the shape aliases instead of literal
  `rounded-lg` / `rounded-md` / `rounded-xl`, which is what lets a style switch at runtime. Nova
  keeps every previous value; `fancy-combobox`'s trigger moves from `rounded-md` to
  `rounded-control` so it matches `input` and `select` (a 2px correction).

- `data-table` drops its surface border: the table is its own card-coloured block (header,
  rows, footer) that pages render directly beneath their summary, with no wrapper card. The
  clear-filters action no longer floats in the middle of the empty body — with the pagination
  footer on it sits beside the result summary, through the new `leadingContent` slot on
  `PaginationControls`; without a footer it stays under the empty state.

Changed (cli):

- **`netix init` asks for the dev server port** (after the base domain; default `5174`, the template's
  own port; also settable with `--port`). The answer replaces that port in `vite.config.ts`,
  `docker-compose.yaml` and the `Dockerfile`, so `pnpm dev` and the dev container agree.
- **A generated service page is now an ordinary page.** `app/service-pages/` is gone — with it
  the `SERVICE_PAGES` registry, the `/workspace/services/:service` resolver route and the
  `app/pages/service-page.tsx` that dispatched on the key. `init` and `service add` now write
  `app/pages/<key>.tsx` and the same three lines a hand-written page needs: a `lazy.ts` export
  (`netix-pages:insert`), a `<Route>` in `app/main.tsx` (`netix-routes:insert`) and a
  `NAVIGATION` entry in `app/lib/navigation.ts` (`netix-nav:insert`). One page convention
  instead of two, and adding or deleting a page is the same operation either way.
  `app/lib/navigation.ts` is the single page registry again: `NavPage` gained `label` and
  `description` (for pages named after a service, whose proper nouns are not translated),
  resolved through the new `navLabel` / `navDescription` helpers, and the breadcrumb, ⌘K
  search and sidebar special cases for service pages are gone. Routes are `/workspace/<key>`,
  no longer `/workspace/services/<key>`.
- `service add` no longer retrofits apps built on the pre-v2 `app/modules` registry; the
  legacy-module bridge is removed. Such an app fails with a missing-anchor error naming the
  file to fix.
- Scaffolded service pages open with the template's `OverviewBanner` + `StatTile` summary
  (total records, rows on this page, current page) and render the DataTable directly beneath it
  — no card wrapper, no border — with a default page size of 10 (`PAGE_SIZE`) and 10/25/50/100
  page-size options. The template's built-in `demo` page follows the same composition.
- **One agent guide per scaffolded app.** The guide is a single file at `docs/AGENTS.md`;
  the root `AGENTS.md` and `CLAUDE.md` are symlinks to it, so agent tooling still auto-loads
  it and there is nothing to keep in sync. `init` rewrites the template's identity in
  `README.md` and `docs/AGENTS.md` (was `README.md`, `CLAUDE.md` and `AGENTS.md`).

Changed (data-table):

- The panel is a flex column instead of an absolutely-positioned scroller over a footer.
  A fixed-height `DataTable` with `pagination` used to hide its own footer underneath the
  table; now the scroller takes the leftover space and the footer sits below it.
- `loadingMode="overlay"` no longer paints a fake four-column skeleton grid inset by 12 px
  inside the table. It dims the real rows edge to edge — a `bg-background/55` scrim sized to
  the scroller, so it covers the full table area and stays put while the rows scroll under
  it — with a single centred spinner pill. The new `loadingLabel` prop names it
  (default `Loading`); `LoadingComponent` still replaces the whole indicator.

Changed (hooks):

- `useUrlPagination` defaults `pageSize` to 10 (was 25), the platform's table default. 25 was
  never one of the footer's default rows-per-page options, so the select had no matching entry.

Changed (api):

- `createDevLoginPrompt` mounts a real sign-in form instead of calling `window.prompt`. A native
  dialog is invisible to password managers — nothing to autofill, nothing offered to save, and
  the password visible while typing. The overlay is a dependency-free `<form>` with
  `autocomplete="username"`/`"current-password"` fields and a submit button, the shape every
  manager recognises, so credentials get saved on the first sign-in and autofilled after
  (`navigator.credentials.store` asks Chromium outright; `http://localhost` is a secure context,
  so saving works there). Failed sign-ins report inline instead of re-opening a dialog. The
  `open`/`close` contract is unchanged — `auth-init.ts` needs no edit — but `close` now really
  unmounts rather than being a no-op.

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
