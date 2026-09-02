# netix-frontend — agent guide

The shared NETIX frontend platform: a small importable runtime contract, a shadcn-compatible registry of copy-in components, and the `netix` CLI. Distributed by immutable git tags (`github:NETIX-AI-OSS/netix-frontend#vX.Y.Z`) with `dist/` committed — never published to npm.

This is the only agent guide in the repository. The root `AGENTS.md` and `CLAUDE.md` are symlinks to this file so agent tooling still auto-loads it; edit this file, never the symlinks.

## The one rule

**Importable vs copy-in.** Shared logic is importable: `api`, `auth`, `hooks`, tokens + `styles.css` + `theme`, `i18n`, `utils`, and `presets/*`. UI is never importable: primitives and reusable composites reach apps through `shadcn add @netix/<item>` and apps own the copies. The registry contains components only; component-private hooks stay colocated with their component. App-specific shell and feature code belongs to frontend-template or the app.

## Build pipeline (order matters)

`pnpm build` = `gen:tokens` → `tsup`. `scripts/gen-tokens.mjs` reads `tokens/netix.tokens.json` (the hand-edited source of truth) and generates `dist/styles.css`, `dist/tokens/*`, `dist/shadcn-tailwind.css` (vendored from the pinned `shadcn` devDep), `dist/fonts/*`, and the generated-in-src files `src/tokens/tokens.ts` + `src/tokens/theme-init-snippet.ts` + `src/tokens/style-names.ts`. After ANY change to tokens, scripts, src, or registry: run `pnpm build` and `pnpm registry:build` and commit the regenerated `dist/` and `r/` — CI fails on drift (`git diff --exit-code -- dist r src/tokens/tokens.ts src/tokens/theme-init-snippet.ts src/tokens/style-names.ts`). Never hand-edit `dist/`, `r/`, or generated `src/tokens` files.

## Layout

- `src/{api,auth,hooks,i18n,tokens,theme,utils}` — the importable logic surface. Coverage gates: 100 % for api/auth/hooks/i18n/tokens/utils, 90 % for theme/cli.
- `src/cli` — the `netix` bin (init/add/service add/schema pull), bundled self-contained by tsup; its deps (`@clack/prompts`, `picocolors`) stay devDependencies. `services.json` at the root maps service → backend repo/spec/port/list route (`listEndpoint`, the collection a generated page opens on — curated per service from its own spec, never `/`) and is the manifest for `init`, `service add` and `schema pull` (`service add` retrofits the same per-service wiring into an existing app; `schema pull` refreshes specs and regenerates the clients). `init` always wires the `user` service — every app authenticates — as a client only, never a page. A generated page is an ordinary page: `app/pages/<key>.tsx` plus the same three anchored lines a hand-written page needs (`app/pages/lazy.ts`, a `<Route>` in `app/main.tsx`, a `NAVIGATION` entry in `app/lib/navigation.ts`) — there is no service-page folder, registry or resolver route. Its columns come from the service's OpenAPI spec (`src/cli/openapi.ts`), never from the rows — a collection that happens to be empty must still render its header row — so `init` and `service add` pull schemas BEFORE they write the pages. Generated pages render the DataTable, and **frontend-template ships it** — scaffolding never fetches from the registry. `pnpm sync:template <template path>` copies required primitives into `app/components/ui` and the DataTable closure into `app/components/composites`; `sync:template:check` gates drift. Registry sources are canonical, the release template carries verbatim copies, and applications permanently own the copies created by `netix init`. **Scaffolding is additive**: frontend-template wires no service, and `init` only ever inserts (`src/cli/service-files.ts` generates the per-service client, its test and the orval block; `transforms.ts` inserts the `ENV.api` and `devUpstreams` entries). Never make the CLI delete or regex-replace template app source — if a scaffolded app needs less of something, take it out of the template instead.
- `registry/netix/ui` — primitive registry sources. They copy to `app/components/ui/*.tsx`.
- `registry/netix/components` — composite registry sources (90 % coverage), one folder per public component. Private helpers stay inside that folder and are not registry items. The app shell, pages, auth wiring, and feature components are template/app code, never registry items. Tests resolve `@/components/ui/*` to `registry/netix/ui` and `@/lib/utils` to the fixture utility.
- `registry.json` → `pnpm registry:build` → `r/` (committed).
- `tests/fixtures/mini-template/` — verbatim frontend-template files the CLI transform tests run against.

## Checks before calling anything done

`pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm registry:build` and a clean `git status` on dist/r.

## Releases (humans decide, agents never tag/push)

Tag order: `pnpm sync:template ../frontend-template` first (a scaffold must ship the components it renders), then tag frontend-template (`template-vX`), then update `src/cli/refs.ts` pins, then tag this repo `vX.Y.Z` (CI creates the GitHub release). Update `CHANGELOG.md` in the same commit as the version bump.

## Documentation

The design-system canon lives in [docs/design-system/](design-system/) — primitives = template's base-nova set, composites = this registry, shared hooks = the package — along with the v1→v2 migration table. Keep it accurate when an implementation rule changes; do not restate it here.
