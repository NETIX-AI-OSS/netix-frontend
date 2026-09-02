# Registry guide

How NETIX components reach an app. (This replaces the old copy-paste guide — nothing is copied by hand any more.)

## What you import from netix-frontend

```css
/* app/assets/styles/globals.css — the whole file */
@import 'netix-frontend/styles.css';
```

That one line delivers Tailwind, the Nova token layer, the shadcn variants sheet, the enter/exit animation utilities, and the app-shell base styles. Tokens-only consumers can import `netix-frontend/tokens.css` (Tailwind v4) or `netix-frontend/tokens/vars.css` (no Tailwind) instead; Tailwind v3 apps use `netix-frontend/tokens/preset`. Mount `ThemeProvider` from `netix-frontend/theme` and serve `theme-init.js` before paint; it carries both the light/dark theme and the [design style](styles.md).

Shared non-visual hooks are imported from `netix-frontend/hooks`; auth types and pure permission helpers come from `netix-frontend/auth`.

## What you copy from registries

`components.json` in a scaffolded app already declares:

```json
"registries": { "@netix": "https://raw.githubusercontent.com/NETIX-AI-OSS/netix-frontend/<ref>/r/{name}.json" }
```

- The **canon primitives** (badge, button, dialog, field, input, label, popover, select, separator, skeleton, table) ship from **@netix** as `registry:ui` items — `@netix/button`, `@netix/table`, and so on. Composites declare these dependencies explicitly. Primitives outside the canon set (accordion, slider, …) still come from the official shadcn registry in the `base-nova` style until NETIX needs to own a customized version.
- NETIX reusable composites come from **@netix**: `pnpm dlx shadcn add @netix/data-table`, or the wrapper `npx netix add data-table` (bare names are namespaced automatically).
- The `data-table` component closure is **already in a scaffolded app** because every generated service page renders it. DataTable's filter, pagination, TanStack setup and private hook ship inside the DataTable folder; supporting `option-list`, `loading-state`, and `empty-state` components are installed with it.

Registry sources live in `registry/netix/` here, are tested in this repo against verbatim base-nova fixtures, and are built with `pnpm registry:build` into `r/` (committed, drift-gated). The `<ref>` in the URL pins the registry version an app tracks — scaffolds pin the release tag; move it deliberately.

Item catalogue: ui (the eleven canon primitives above) and reusable composites (`data-table`, `confirm-modal`, `form-modal`, `fancy-combobox`, `tree-view`, `option-list`, `loading-state`, `empty-state`). There are no hook, shell, page, `column-filter`, `pagination-controls`, `data-table-types`, or `table-features` items.

### DataTable owns TanStack Table

Callers do not create a TanStack table instance or import a feature set. DataTable registers its own v9 features and exposes a normal component API:

```tsx
import { DataTable, type DataTableColumn } from '@/components/composites/data-table'

const columns: DataTableColumn<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

return (
  <DataTable
    data={rows}
    columns={columns}
    state={{ pagination }}
    onPaginationChange={setPagination}
    rowCount={total}
    manualPagination
    pagination={{ pageSizeOptions: [10, 25, 50] }}
  />
)
```

Server pagination and sorting remain controlled by the application: `state.pagination` is the current value and `onPaginationChange` is its callback. The standard footer renders an accessible first/previous/number/next/last pager, with a compact page window for long lists. When column filters are active and no rows match, the clear-filters action sits in that footer beside the result summary (the `leadingContent` slot of `PaginationControls`) rather than floating in the empty body; without a footer it renders under the empty state. The surface is borderless: the table is its own card-coloured block, so pages render it directly beneath their summary banner with no wrapper card. For a cursor API with no total, pass `pageCount={-1}` and `pagination={{ hasNextPage }}`; the parent still owns when the next action is possible. A local table may pass TanStack row-model options directly to DataTable. Do not reach for `@tanstack/react-table/legacy`; nothing in the registry uses the deprecated v8 compatibility adapter.

## Dependencies the items assume

Items declare their own npm deps (`@tanstack/react-table`, `lucide-react`, `react-hook-form`) and the shadcn CLI installs them. The base-nova primitive set is assumed present in a scaffold.

## Updating a copied item

Re-run `add` with `--overwrite` to take the registry's newer version, then review the diff like any code change — the app owns the file. If you changed the copy deliberately, keep your version; nothing forces an update.
