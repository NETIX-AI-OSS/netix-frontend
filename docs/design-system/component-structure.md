# Component structure

NETIX has three boundaries. Complexity does not decide ownership; reuse and lifecycle do.

| Layer                           | Delivery                   | App location                         | What belongs there                                                                  |
| ------------------------------- | -------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| Registry primitives             | `shadcn add @netix/<item>` | `app/components/ui/*.tsx`            | Small visual building blocks such as button, input, dialog and table                |
| Registry composites             | `shadcn add @netix/<item>` | `app/components/composites/<name>/`  | Reusable UI systems such as DataTable, modals and comboboxes                        |
| Template application components | `netix init` only          | `app/components/application/<name>/` | Product shell, language/theme switchers, command menu, breadcrumbs and page layouts |
| Importable library              | package dependency         | imported from `netix-frontend/*`     | Stable API/auth contracts, hooks, utilities, tokens, CSS and theme runtime          |

Both registry layers are copy-in UI: the generated application permanently owns those files. Template application components are also permanently app-owned, but they are not registry items because they encode NETIX application structure and wiring rather than generally reusable UI.

## Folder rule

- Primitives are single files under `components/ui` to match shadcn conventions.
- Every composite and every application component has a named folder with an `index.tsx` entrypoint.
- Private implementation files stay inside their owner's folder and are never separate registry items.
- CLI-generated service-list pages are ordinary pages at `app/pages/<service>.tsx`; application-owned feature components stay beside the feature that owns them.
- Never introduce `recipes`, `shared`, `common`, or loose files directly under `app/components`.

DataTable is one registry composite. Its column filter, pagination and TanStack feature setup are private files or implementation details inside `components/composites/data-table`; callers import only from the DataTable entrypoint. DataTable owns table construction, pinning support, loading, empty states and pagination presentation. Callers own the query, rows, columns and controlled server-pagination state.

A generic nonvisual hook with a stable cross-app contract belongs in `netix-frontend/hooks`. A hook used only by one component stays private in that component's folder. Product-specific hooks stay with their application feature.
