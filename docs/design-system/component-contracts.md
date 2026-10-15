# Component contracts

UI primitives live only in `app/components/ui`; NETIX composites arrive via `@netix/<item>` and live in `app/components/composites/<name>`. Neither has API, auth, route, or business imports, and both use semantic tokens rather than raw brand or status values.

| Area       | Components and variants                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Actions    | `Button`: default, secondary, outline, ghost, danger, success; `sm`, default, `lg`, `icon`, `icon-sm`; loading/pressed states |
| Forms      | input, textarea, label, field/description/error, checkbox, radio group, switch, select, command list/palette                  |
| Feedback   | badge/status badge (`success`, `warning`, `danger`, `info`), skeleton, empty state, error state, Sonner toaster               |
| Overlays   | tooltip, popover, dropdown menu, dialog, alert dialog, sheet/drawer                                                           |
| Navigation | breadcrumb, tabs, pagination, scroll area                                                                                     |
| Data       | card and table primitives; the DataTable composite with pinning, filtering, loading, empty and pagination states              |

All interactive controls expose a focus-visible state; form primitives also expose `aria-invalid` feedback. Do not add a variant without documenting why it cannot be served by an existing semantic intent. `default`, `secondary`, `outline`, `ghost`, `danger`, and `success` are the approved button intents. Use `icon-sm` for compact toolbar controls and `icon` when a 36px avatar or icon affordance must align to that group.

Status colours are a four-slot ladder, and each slot has one job in both themes. Text and icons that must be read use `text-status-<name>-foreground` (at least 4.5:1 on the card, muted panel, page background and the status surface). The bare `status-<name>` is the fill and graph colour (at least 3:1 on the card and muted panel), so it takes white ink as a solid badge, dot or bar. `-surface` and `-border` build the tinted container. The sequential chart ramp `chart-sequential-1..5` runs from faint to strong against the surface in both themes, so step 1 is always "low".
