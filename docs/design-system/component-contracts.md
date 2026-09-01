# Component contracts

UI primitives live only in `app/components/ui` (base-nova, from the official shadcn registry); NETIX composites arrive via `@netix/<item>` and live beside them. Neither has API, auth, route, or business imports, and both use semantic tokens rather than raw brand or status values.

| Area       | Components and variants                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Actions    | `Button`: default, secondary, outline, ghost, danger, success; `sm`, default, `lg`, `icon`, `icon-sm`; loading/pressed states |
| Forms      | input, textarea, label, field/description/error, checkbox, radio group, switch, select, command list/palette                  |
| Feedback   | badge/status badge (`success`, `warning`, `danger`, `info`), skeleton, empty state, error state, Sonner toaster               |
| Overlays   | tooltip, popover, dropdown menu, dialog, alert dialog, sheet/drawer                                                           |
| Navigation | breadcrumb, tabs, pagination, scroll area                                                                                     |
| Data       | card, table primitives, `DataTableShell` recipe                                                                               |

All interactive controls expose a focus-visible state; form primitives also expose `aria-invalid` feedback. Do not add a variant without documenting why it cannot be served by an existing semantic intent. `default`, `secondary`, `outline`, `ghost`, `danger`, and `success` are the approved button intents. Use `icon-sm` for compact toolbar controls and `icon` when a 36px avatar or icon affordance must align to that group.
