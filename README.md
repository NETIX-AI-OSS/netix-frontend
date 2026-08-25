# netix-frontend

NETIX's shared frontend library: one package, one version, subpath entry points.

| Entry point                   | Contents                                                                                 | Platforms |
| ----------------------------- | ---------------------------------------------------------------------------------------- | --------- |
| `netix-frontend/api`          | `createHttpClient`, `createMutator`, `ApiError`, envelope parser, retry, Sentry filters  | web + RN  |
| `netix-frontend/hooks`        | `useFilters`, `usePagination`, `useTabs`, `useTimeRange`, `usePermissions`, …            | web + RN  |
| `netix-frontend/hooks/router` | the same hooks bound to react-router search params (`useRouterFilters`, …)               | web only  |
| `netix-frontend/utils`        | `cn`, date module, formatters, collections, `STATUS_COLORS`, `getFileMetadata`           | web + RN  |
| `netix-frontend/utils/dom`    | `downloadFile`, `uploadFile`, `lazyWithRetry` + chunk-reload guard                       | web only  |
| `netix-frontend/i18n`         | `createI18n`, `createOrganizationLocale`, `normalizeLanguage`, shared `common` catalog   | web + RN  |
| `netix-frontend/ui`           | 33 shadcn primitives + tier-2 composites + `ThemeProvider`, styled by `ui/styles.css`    | web only  |
| `netix-frontend/tokens`       | design tokens: JS access + `tokens.css` (v4), `preset` (v3), `vars.css`, `theme-init.js` | web only  |
| `netix-frontend/fonts/*`      | subsetted Archivo woff2 faces (400, 400 italic, 500, 600, 700)                           | web only  |
| `netix-frontend/presets/*`    | `presets/eslint`, `presets/eslint-strict`, `presets/tsconfig`, `presets/prettier`        | tooling   |

Install by immutable tag:

```json
"netix-frontend": "github:NETIX-AI-OSS/netix-frontend#v1.0.0"
```

`dist/` is committed (no `prepare` script) so installs need zero consumer configuration; CI gates dist drift.
Only `react` is a required peer; every other peer is optional — install just what the entry points you use need.

## api

`createHttpClient({ baseURL | getBaseURL, paramsSerializer, timeout, onDisplayError, onAuthError, retry })`
returns an axios instance with the shared error interceptor (every branch throws `ApiError`;
403 stays in-app, 401 is a no-op unless `onAuthError` is given) and idempotent-only retry
(GET/HEAD/OPTIONS + 408/429 + network errors, equal-jitter backoff, Retry-After respected).
`createMutator(client)` plugs into orval. `parseEnvelope` normalizes `{status_code, messages}`
bodies — arrays, bare strings, stringified arrays, DRF `ErrorDetail` reprs — to `string[]`.
Retry policies for both data layers: `createQueryRetryPolicy` (react-query) and
`createSwrOnErrorRetry` (swr, exactly 3 retries on a 0-based attempt index).
Sentry: `createSentryBeforeSend` drops handled HTTP statuses (`HANDLED_HTTP_STATUSES` = 400/403/404)
plus canceled/network noise and fingerprints non-Error events. `createDevTokenManager` gates dev
tokens on dev-mode + credentials + not-test, with all env values injected.

## hooks

Prop-driven, router-free core: `useFilters` (with `inclusiveEndDate` knob), `usePagination`,
`useTabs`, `useTimeRange` (+ `TIME_DURATIONS`, `DURATION_OPTIONS`, `OVERALL_FROM_EPOCH`, epoch-range
helpers), `useIsMobile`, `useResizeObserver`, `useDelayedLoading`, and `usePermissions` +
`<PermissionGate>` (fail-closed, `isLoaded` exposed, bind your auth via `configurePermissions`).
`netix-frontend/hooks/router` re-binds filters/pagination/tabs/time-range to react-router
search params — separate entry so `./hooks` stays RN-safe.

## utils

`cn` (clsx + tailwind-merge, bundled). Date module: the 17 fleet format tokens
(`FULL_DATE_FORMAT`, `STANDARD_TIME_FORMAT`, …) and the `getFullDate`/`getStandardTime`/… family,
`parseLocalDate`, `formatDurationHMS` + `formatTimerClock`, `intervalToDuration`,
`isScheduleDayValid` (plus the deprecated `isScheduleDayVaild` alias), `configureDates` for the
i18n'd `'NA'` string. Formatters: `getFullUserName`, `getUserNameInitials`, `formatFileSize`.
Collections: `commaSeparatedToArray({as})`, `arrayToCommaSeparated`, `removeDuplicates`,
`filterIntersection`, `removeEmptyAttributes`, `emailValidator`, `getEnumOptions`.
`STATUS_COLORS` (incl. `DARK_GREEN`), `getFileMetadata`.
DOM-only (`utils/dom`): `downloadFile`/`saveFile`/`uploadFile`/`uploadStaticFile`,
`lazyWithRetry` + `installChunkErrorReloadHandler`.

## i18n

`createI18n(options)` boots i18next (debug off, `i18n.dir()`-based RTL, RN language handling,
SSR-guarded document dir). `createOrganizationLocale` is the per-identity org-locale runtime
(pending-key + race guards, `clearActiveIdentity` on logout). The shared `common` catalog
(en/ar/es) mounts as a real namespace: `t('common:confirm')` — app catalogs win on merge.

## ui

All primitives and composites ship from one entry with one stylesheet:

```tsx
import 'netix-frontend/ui/styles.css'
import { Button, DataTable, ThemeProvider } from 'netix-frontend/ui'
```

`styles.css` is precompiled by the lib's own Tailwind v4 (no preflight) and embeds the token layer,
so it works unchanged in v3 apps and apps with no Tailwind. Composites: `DataTable` (+ skeleton
loading, `ColumnFilter`, `PaginationControls`; @tanstack/react-table v9), `Combobox`/`FancyCombobox`
(RTL-aware), `TreeView`, `Form*` (react-hook-form glue), `FormModal`/`ConfirmModal`,
`LoadingState`/`EmptyState`, `Toaster` (sonner), `OptionList`. Theming: `ThemeProvider` + `useTheme`
persist under the single `netix-theme` key (`THEME_STORAGE_KEY`).

## tokens

`tokens/netix.tokens.json` is the source of truth; `pnpm gen:tokens` emits every artifact.
Tailwind v4 apps: `@import 'tailwindcss'` then `@import 'netix-frontend/tokens/tokens.css'` —
tokens.css carries an `@layer base` block, so it must come after tailwind or layer order is
undefined. Tailwind v3 apps: `presets: [require('netix-frontend/tokens/preset')]`. No Tailwind:
`netix-frontend/tokens/vars.css`. Pre-paint theme: `<script src=".../tokens/theme-init.js">`.
JS access: `token(name, mode)`, `cssVar`, `statusColor`, `noticeColor`, `chartPalette` (Okabe–Ito).
Font faces load from `netix-frontend/fonts/*` (declared in tokens.css/vars.css).

## Develop

```bash
pnpm install
pnpm build        # tokens + tsup + css
pnpm test         # vitest; coverage gates: 100% non-ui, 90% ui
pnpm lint && pnpm typecheck && pnpm format:check
```

Releases: bump `version`, tag `vX.Y.Z` (immutable via ruleset), GitHub release. The release workflow asserts tag == package version.
