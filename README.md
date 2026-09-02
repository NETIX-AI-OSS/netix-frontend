# netix-frontend

The NETIX frontend platform: a small importable runtime contract, the Nova design tokens, a shadcn-compatible registry of copy-in components, and the `netix` CLI that scaffolds new apps.

One rule organises everything: **shared logic is imported; visual source is copied.** `createHttpClient`, `useCurrentUser`, and URL-state hooks are imported. Tokens and the global stylesheet are imported and cannot be ejected; UI components are copied and are yours.

## Install

```json
"netix-frontend": "github:NETIX-AI-OSS/netix-frontend#v2.0.0"
```

Immutable git tags, `dist/` committed, no build step on install, no npm registry. Only `react` is a required peer; everything else is optional and per-entry.

## Create a new app

```bash
npx github:NETIX-AI-OSS/netix-frontend init my-app-ui
```

The CLI scaffolds from `NETIX-AI/frontend-template` (private — needs an authenticated `gh`), asks which services to wire (data, cafm, asset, tag, report, ml-engine, … — every NETIX-AI backend with a public API, see `services.json`), generates the per-service API clients + orval config + env plumbing, pulls the OpenAPI specs from the backend repos, installs, generates the typed clients, and makes the first commit last — so a fresh app starts with a clean tree. The user-management service is not part of the question: every app authenticates, so it is always wired (as a client only — the template's access pages are its UI, so it gets no page). Every other selected service gets an ordinary page at `app/pages/<key>.tsx` — wired by a `lazy.ts` export, a route and a navigation entry, exactly like a hand-written one — opening on its `listEndpoint` from `services.json`, so `pnpm dev` shows real rows rather than an error state. Then, day to day:

```bash
npx netix add data-table        # copy @netix registry items (shadcn under the hood)
npx netix service add cafm      # wire another backend service in (client + env + module + schema)
npx netix schema pull           # refresh specs for every wired service, regenerate the clients
```

Service names are comma- or space-separated (`data,cafm` or `data cafm`); `schema pull` with none named refreshes all of them and runs `pnpm generate:client` afterwards (`--no-generate` to skip). `service add` is additive and idempotent: re-adding a wired service just refreshes its spec and client, and files the app already owns are never overwritten.

## Entry points

| Entry                                                                                    | Contents                                                                                                                                                                                         | Platforms |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| `netix-frontend/api`                                                                     | `createHttpClient`, `createMutator`, retry/error/envelope policy, TanStack Query retry policy, Sentry filter, `buildAuthConfig` + the canonical auth constants, `createDevLoginPrompt` (web dev) | web + RN  |
| `netix-frontend/auth`                                                                    | current-user normalization and pure permission derivation/checks                                                                                                                                 | web + RN  |
| `netix-frontend/hooks`                                                                   | `useCurrentUser`, `usePermissions`, and router-agnostic URL pagination/tab hooks                                                                                                                 | web       |
| `netix-frontend/utils`                                                                   | `cn`, collections, date kernel + formatters, currency/file helpers                                                                                                                               | web + RN  |
| `netix-frontend/utils/dom`                                                               | downloads, uploads, `lazyWithRetry`                                                                                                                                                              | web       |
| `netix-frontend/i18n`                                                                    | `createI18n`, organization locale, common resources                                                                                                                                              | web + RN  |
| `netix-frontend/tokens`                                                                  | resolved token values, `statusColor`/`noticeColor`/`chartPalette`, `themeInitSnippet`                                                                                                            | web + RN  |
| `netix-frontend/theme`                                                                   | `ThemeProvider`/`useTheme` (reads the same `data-theme-key`/`data-default-theme` attributes as theme-init.js)                                                                                    | web       |
| `netix-frontend/styles.css`                                                              | the whole global stylesheet: Tailwind v4 + Nova tokens + shadcn variants + animation utilities + app-shell base                                                                                  | web       |
| `netix-frontend/tokens.css`, `tokens/theme-only.css`, `tokens/vars.css`, `tokens/preset` | token layer à la carte (v4 apps, compile-time-only, no-Tailwind apps, Tailwind v3 preset)                                                                                                        | web       |
| `netix-frontend/theme-init.js`                                                           | pre-paint FOUC guard (copy to `public/`, or inline `themeInitSnippet`)                                                                                                                           | web       |
| `netix-frontend/fonts/*`, `presets/*`, `services.json`                                   | Archivo faces; eslint/tsconfig/prettier presets; the service manifest                                                                                                                            | tooling   |

There is deliberately no importable UI. Shared hooks are package logic; component-private hooks remain inside their copied component.

## Styles

Tailwind v4 app (the scaffold): `globals.css` is exactly one line — `@import 'netix-frontend/styles.css';`. The file is a Tailwind **source**, compiled by your build; nothing is precompiled, so there is nothing to purge and no `content` globs pointed at this package.

Tokens only: `@import 'tailwindcss'; @import 'netix-frontend/tokens.css';` (order matters). Tailwind v3: `presets: [require('netix-frontend/tokens/preset')]`. No Tailwind: `netix-frontend/tokens/vars.css`.

Token source of truth: `tokens/netix.tokens.json` → `pnpm gen:tokens` fans out every artifact; CI fails if the committed output drifts.

## The @netix registry

Component sources live in `registry/netix/components`, are tested here against verbatim base-nova fixtures, and are built into `r/` (committed). Apps consume them through `components.json`:

```json
"registries": { "@netix": "https://raw.githubusercontent.com/NETIX-AI-OSS/netix-frontend/v2.0.0/r/{name}.json" }
```

@netix carries the eleven primitives required by NETIX composites (`@netix/button`, `@netix/table`, …) plus reusable composites: DataTable, modals, combobox, and tree view. It does not publish hooks, application components, shells, or pages. Primitives outside the canon set come from the official shadcn registry in the `base-nova` style. Full catalogue and rules: [docs/design-system](docs/design-system/README.md).

## Develop

```bash
pnpm install
pnpm build            # gen:tokens + tsup (JS, d.ts, the netix CLI)
pnpm registry:build   # registry.json -> r/
pnpm test:coverage    # gates: 100% (api/i18n/tokens/utils), 90% (theme/cli/registry)
pnpm typecheck && pnpm lint && pnpm format:check
```

Commit regenerated `dist/` and `r/` with the change that caused them. Release: template tag first (`template-vX`), update `src/cli/refs.ts`, bump the version + `CHANGELOG.md`, tag `vX.Y.Z` (tags are immutable; CI publishes the GitHub release).
