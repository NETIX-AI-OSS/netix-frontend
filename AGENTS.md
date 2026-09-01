# netix-frontend — agent guide

The shared NETIX frontend platform: a small importable runtime contract, a shadcn-compatible registry of copy-in components, and the `netix` CLI. Distributed by immutable git tags (`github:NETIX-AI-OSS/netix-frontend#vX.Y.Z`) with `dist/` committed — never published to npm.

## The one rule

**Importable vs copy-in.** Only things that must stay identical across every app are importable: `api` (HTTP client factory, retry, errors, auth config), tokens + `styles.css` + `theme`, `i18n`, `utils`, `presets/*`. UI components and hooks are NEVER importable — they live in `registry/netix/` and reach apps via `shadcn add @netix/<item>` (apps own the copies). Do not add ui/hook exports back to package.json, and do not propose importing components from this package.

## Build pipeline (order matters)

`pnpm build` = `gen:tokens` → `tsup`. `scripts/gen-tokens.mjs` reads `tokens/netix.tokens.json` (the hand-edited source of truth) and generates `dist/styles.css`, `dist/tokens/*`, `dist/shadcn-tailwind.css` (vendored from the pinned `shadcn` devDep), `dist/fonts/*`, and the generated-in-src files `src/tokens/tokens.ts` + `src/tokens/theme-init-snippet.ts`. After ANY change to tokens, scripts, src, or registry: run `pnpm build` and `pnpm registry:build` and commit the regenerated `dist/` and `r/` — CI fails on drift (`git diff --exit-code -- dist r src/tokens/tokens.ts src/tokens/theme-init-snippet.ts`). Never hand-edit `dist/`, `r/`, or generated `src/tokens` files.

## Layout

- `src/{api,i18n,tokens,theme,utils}` — the importable surface. Coverage gates: 100 % for api/i18n/tokens/utils, 90 % for theme/cli.
- `src/cli` — the `netix` bin (init/add/schema pull), bundled self-contained by tsup; its deps (`@clack/prompts`, `picocolors`) stay devDependencies. `services.json` at the root maps service → backend repo/spec/port and is the manifest for `init` and `schema pull`.
- `registry/netix/{hooks,components,blocks}` — registry item sources (90 % coverage; blocks excluded — they are template snapshots). Items import app-style aliases (`@/components/ui/*`, `@/lib/utils`, `@/hooks/*`) resolved in tests to `registry/_fixtures` (verbatim base-nova copies from frontend-template — never edit fixtures here; fix the template, then re-copy).
- `registry.json` → `pnpm registry:build` → `r/` (committed).
- `tests/fixtures/mini-template/` — verbatim frontend-template files the CLI transform tests run against.

## Checks before calling anything done

`pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm registry:build` and a clean `git status` on dist/r.

## Releases (humans decide, agents never tag/push)

Tag order: frontend-template first (`template-vX`), then update `src/cli/refs.ts` pins, then tag this repo `vX.Y.Z` (CI creates the GitHub release). Update `CHANGELOG.md` in the same commit as the version bump.

See `docs/design-system/` for the design-system canon (primitives = template's base-nova set; composites/hooks = this registry) and the v1→v2 migration table.
