# Registry guide

How NETIX components reach an app. (This replaces the old copy-paste guide — nothing is copied by hand any more.)

## What you import from netix-frontend

```css
/* app/assets/styles/globals.css — the whole file */
@import 'netix-frontend/styles.css';
```

That one line delivers Tailwind, the Nova token layer, the shadcn variants sheet, the enter/exit animation utilities, and the app-shell base styles. Tokens-only consumers can import `netix-frontend/tokens.css` (Tailwind v4) or `netix-frontend/tokens/vars.css` (no Tailwind) instead; Tailwind v3 apps use `netix-frontend/tokens/preset`. Mount `ThemeProvider` from `netix-frontend/theme` and serve `theme-init.js` before paint.

## What you copy from registries

`components.json` in a scaffolded app already declares:

```json
"registries": { "@netix": "https://raw.githubusercontent.com/NETIX-AI-OSS/netix-frontend/<ref>/r/{name}.json" }
```

- Stock primitives (button, dialog, select, …) come from the **official shadcn registry** with the app's `base-nova` style: `pnpm dlx shadcn add dialog`.
- NETIX composites, hooks and blocks come from **@netix**: `pnpm dlx shadcn add @netix/data-table`, or the wrapper `npx netix add data-table` (bare names are namespaced automatically).

Registry sources live in `registry/netix/` here, are tested in this repo against verbatim base-nova fixtures, and are built with `pnpm registry:build` into `r/` (committed, drift-gated). The `<ref>` in the URL pins the registry version an app tracks — scaffolds pin the release tag; move it deliberately.

Item catalogue: hooks (`search-params`, `use-tabs`, `use-filters`, `use-pagination`, `use-time-range`, `use-permissions`, `use-delayed-loading`, `use-is-mobile`, `use-resize-observer`, `router-hooks`), components (`data-table` family, `pagination-controls`, `confirm-modal`, `form-modal`, `fancy-combobox`, `tree-view`, `option-list`, `loading-state`, `empty-state`), blocks (`recipes`, `app-layout`, `app-sidebar`, `app-topbar`).

## Dependencies the items assume

Items declare their own npm deps (`@tanstack/react-table`, `lucide-react`, `react-hook-form`, `react-router`) and the shadcn CLI installs them. Two things are assumed present and never installed by the registry: the `netix-frontend` package itself (`github:NETIX-AI-OSS/netix-frontend#<tag>`) and the base-nova primitive set a scaffold ships with.

## Updating a copied item

Re-run `add` with `--overwrite` to take the registry's newer version, then review the diff like any code change — the app owns the file. If you changed the copy deliberately, keep your version; nothing forces an update.
