# Migration guide (v1 → v2)

netix-frontend 2.0.0 removed the importable UI and hooks surface. Apps pinned to `#v1.0.2` keep working untouched; migrate when you bump.

| v1 import                                                   | v2 source                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `netix-frontend/ui/styles.css`                              | `netix-frontend/styles.css` (single global stylesheet)                                            |
| `netix-frontend/ui/styles-notokens.css`                     | removed — import `netix-frontend/tokens.css` after `tailwindcss`                                  |
| `netix-frontend/tokens/tokens.css`                          | unchanged, or the `netix-frontend/tokens.css` alias                                               |
| `netix-frontend/ui/theme` (ThemeProvider)                   | `netix-frontend/theme`                                                                            |
| `netix-frontend/ui` / `netix-frontend/ui/<primitive>`       | vendored base-nova primitive: `pnpm dlx shadcn add <name>` → `@/components/ui/<name>`             |
| `netix-frontend/ui/<composite>` (data-table, form-modal, …) | `pnpm dlx shadcn add @netix/<name>` → `@/components/<name>`                                       |
| `netix-frontend/hooks` / `hooks/router`                     | `pnpm dlx shadcn add @netix/<hook>` / `@netix/router-hooks` → `@/hooks/<name>`                    |
| `STATUS_COLORS` from `netix-frontend/utils`                 | removed — use the Nova status tokens (`statusColor` from `netix-frontend/tokens`)                 |
| Old status names (`ok`, `critical`, `offline`, …)           | Nova ladder: `success`, `warning`, `danger`, `info`, `neutral` × `base/foreground/surface/border` |

Steps: bump the dep to `#v2.0.0`; collapse `globals.css` to `@import 'netix-frontend/styles.css';` and delete local token sheets; add the `@netix` entry to `components.json`; replace each `netix-frontend/ui|hooks` import with its copied file (the registry item names match the old module names); swap ThemeProvider to `netix-frontend/theme`; drop `tw-animate-css` (the lib stylesheet vendors the animation utilities). Tailwind v3 apps keep `netix-frontend/tokens/preset` and no longer need to scan the lib's dist in `content` globs — v2 ships no precompiled component CSS.

`api`, `utils` (minus STATUS_COLORS), `i18n`, `tokens`, and `presets/*` are unchanged, and `api` gains `buildAuthConfig` — delete the app's hand-copied `authConfig.ts` and build it from there.
