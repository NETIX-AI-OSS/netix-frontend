# netix-frontend

The NETIX frontend platform: a small importable runtime contract, the Nova design tokens, a shadcn-compatible registry of copy-in components, and the `netix` CLI that scaffolds new apps.

One rule organises everything: **things that must stay identical across every app are imported; everything else is copied.** `createHttpClient` is imported. `useTabs` is copied. Tokens and the global stylesheet are imported and cannot be ejected; UI components are copied and are yours.

## Install

```json
"netix-frontend": "github:NETIX-AI-OSS/netix-frontend#v2.0.0"
```

Immutable git tags, `dist/` committed, no build step on install, no npm registry. Only `react` is a required peer; everything else is optional and per-entry.

## Create a new app

```bash
npx github:NETIX-AI-OSS/netix-frontend init my-app-ui
```

The CLI scaffolds from `4T5Labs/frontend-template` (private — needs an authenticated `gh`), asks which services to wire (data, cafm, asset, user, notification — see `services.json`), generates the per-service API clients + orval config + env plumbing, pulls the OpenAPI specs from the backend repos, installs, generates the typed clients, and makes the first commit. Then, day to day:

```bash
npx netix add data-table        # copy @netix registry items (shadcn under the hood)
npx netix schema pull           # refresh specs for the services the app uses
```

## Entry points

| Entry                                                                                    | Contents                                                                                                                                                                              | Platforms |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `netix-frontend/api`                                                                     | `createHttpClient`, `createMutator`, retry/error/envelope policy, SWR + react-query retry helpers, Sentry filter, `buildAuthConfig` + the canonical auth constants, dev-token manager | web + RN  |
| `netix-frontend/utils`                                                                   | `cn`, collections, date kernel + formatters, currency/file helpers                                                                                                                    | web + RN  |
| `netix-frontend/utils/dom`                                                               | downloads, uploads, `lazyWithRetry`                                                                                                                                                   | web       |
| `netix-frontend/i18n`                                                                    | `createI18n`, organization locale, common resources                                                                                                                                   | web + RN  |
| `netix-frontend/tokens`                                                                  | resolved token values, `statusColor`/`noticeColor`/`chartPalette`, `themeInitSnippet`                                                                                                 | web + RN  |
| `netix-frontend/theme`                                                                   | `ThemeProvider`/`useTheme` (reads the same `data-theme-key`/`data-default-theme` attributes as theme-init.js)                                                                         | web       |
| `netix-frontend/styles.css`                                                              | the whole global stylesheet: Tailwind v4 + Nova tokens + shadcn variants + animation utilities + app-shell base                                                                       | web       |
| `netix-frontend/tokens.css`, `tokens/theme-only.css`, `tokens/vars.css`, `tokens/preset` | token layer à la carte (v4 apps, compile-time-only, no-Tailwind apps, Tailwind v3 preset)                                                                                             | web       |
| `netix-frontend/theme-init.js`                                                           | pre-paint FOUC guard (copy to `public/`, or inline `themeInitSnippet`)                                                                                                                | web       |
| `netix-frontend/fonts/*`, `presets/*`, `services.json`                                   | Archivo faces; eslint/tsconfig/prettier presets; the service manifest                                                                                                                 | tooling   |

There is deliberately no importable UI and no importable hooks — see the registry.

## Styles

Tailwind v4 app (the scaffold): `globals.css` is exactly one line — `@import 'netix-frontend/styles.css';`. The file is a Tailwind **source**, compiled by your build; nothing is precompiled, so there is nothing to purge and no `content` globs pointed at this package.

Tokens only: `@import 'tailwindcss'; @import 'netix-frontend/tokens.css';` (order matters). Tailwind v3: `presets: [require('netix-frontend/tokens/preset')]`. No Tailwind: `netix-frontend/tokens/vars.css`.

Token source of truth: `tokens/netix.tokens.json` → `pnpm gen:tokens` fans out every artifact; CI fails if the committed output drifts.

## The @netix registry

Component/hook/block sources live in `registry/netix/`, are tested here against verbatim base-nova fixtures, and are built into `r/` (committed). Apps consume them through `components.json`:

```json
"registries": { "@netix": "https://raw.githubusercontent.com/NETIX-AI-OSS/netix-frontend/v2.0.0/r/{name}.json" }
```

Stock primitives (button, dialog, …) come from the official shadcn registry in the `base-nova` style; @netix carries only NETIX-specific items: the data-table family, modals, combobox, tree view, the URL-state hooks, and the app-shell blocks. Full catalogue and rules: [docs/design-system](docs/design-system/README.md).

## Develop

```bash
pnpm install
pnpm build            # gen:tokens + tsup (JS, d.ts, the netix CLI)
pnpm registry:build   # registry.json -> r/
pnpm test:coverage    # gates: 100% (api/i18n/tokens/utils), 90% (theme/cli/registry)
pnpm typecheck && pnpm lint && pnpm format:check
```

Commit regenerated `dist/` and `r/` with the change that caused them. Release: template tag first (`template-vX`), update `src/cli/refs.ts`, bump the version + `CHANGELOG.md`, tag `vX.Y.Z` (tags are immutable; CI publishes the GitHub release).
