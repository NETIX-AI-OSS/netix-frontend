# Design styles

A **style** is the shape half of the design system: how round controls are, how much air a
control carries, how a panel differs from a popup. It is a second axis, orthogonal to light/dark
— the same palette, typography and spacing scale in both. Switching is instant, needs no rebuild,
and touches no component source, because every primitive expresses radius through _shape aliases_
rather than literal `rounded-*` values.

Two styles ship:

| Style            | Look                         | Notes                                                                       |
| ---------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `nova` (default) | Compact, lightly rounded     | The system's existing appearance, unchanged.                                |
| `rhea`           | Pill controls, softer panels | Modelled on shadcn's Rhea; the aesthetic `user-profile-ui` had hand-rolled. |

## How it works

`tokens/netix.tokens.json` holds a `styles` map. `pnpm gen:tokens` turns each entry into an
unlayered CSS block, and the first style also answers to a bare `:root`:

```css
:root,
[data-style='nova'] {
  --radius-control: var(--radius-lg); /* … */
}
[data-style='rhea'] {
  --radius-control: var(--radius-pill); /* … */
}
```

Unlayered is deliberate: these must beat the `@layer theme` defaults Tailwind emits for the same
custom properties. Because the default style is bound to `:root`, an app that never sets the
attribute is unaffected, and a nested `[data-style='nova']` inside a Rhea page switches back.

The radius aliases are also declared in the non-inline `@theme` block, so Tailwind generates them
as ordinary utilities — corner and side variants included (`rounded-ss-panel`, `rounded-s-control`).

## The shape aliases

Use these instead of the raw scale in any component that should follow the style:

| Alias                 | Utility                | Use for                                                                             | Nova                     | Rhea          |
| --------------------- | ---------------------- | ----------------------------------------------------------------------------------- | ------------------------ | ------------- |
| `--radius-control`    | `rounded-control`      | fixed-height controls: button, input, select trigger, tabs list, nav row            | `--radius-lg`            | pill          |
| `--radius-control-sm` | `rounded-control-sm`   | `sm` / `icon-sm` controls                                                           | `min(--radius-md, 12px)` | pill          |
| `--radius-control-xs` | `rounded-control-xs`   | `xs` / `icon-xs` controls                                                           | `min(--radius-md, 10px)` | pill          |
| `--radius-field`      | `rounded-field`        | inputs that **grow**: textarea, chip/multi-select triggers, bordered field wrappers | `--radius-lg`            | `1rem`        |
| `--radius-surface`    | `rounded-surface`      | floating surfaces: popover, menu, select popup                                      | `--radius-lg`            | `--radius-xl` |
| `--radius-panel`      | `rounded-panel`        | cards, dialogs, sheets, the data-table shell                                        | `--radius-xl`            | `1.25rem`     |
| `--radius-item`       | `rounded-item`         | rows inside menus and lists, tab triggers, tooltips                                 | `--radius-md`            | pill          |
| `--radius-item-sm`    | `rounded-item-sm`      | chips, dense rows, skeleton lines                                                   | `--radius-sm`            | pill          |
| `--radius-indicator`  | `rounded-indicator`    | checkbox and similar small marks                                                    | `4px`                    | `5px`         |
| `--control-px`        | `px-(--control-px)`    | control padding (default and `sm`)                                                  | `0.625rem`               | `0.75rem`     |
| `--control-px-xs`     | `px-(--control-px-xs)` | `xs` control padding                                                                | `0.5rem`                 | `0.625rem`    |
| `--control-px-lg`     | `px-(--control-px-lg)` | `lg` control padding                                                                | `0.625rem`               | `1rem`        |

A pill is only ever right at a fixed single-line height. Anything that can grow vertically —
a textarea, a multi-select that wraps chips, a field wrapper holding a label and a description —
takes `rounded-field`, which stays bounded in every style. shadcn's own Rhea does the same: pill
buttons, but `rounded-2xl` on `.cn-textarea`. Where one component is both (an input group is a
pill until it wraps a textarea), condition it: `has-[>textarea]:rounded-field`.

The raw scale (`rounded-sm`/`md`/`lg`/`xl`, `--radius-pill`) is still there and never moves — reach
for it only where a shape must stay fixed across styles.

## Using it in an app

The scaffold is already wired. `<html>` carries `data-style-key` and `data-default-style`,
`theme-init.js` applies the stored style before first paint, and `ThemeProvider` owns it after:

```tsx
const { theme, setTheme, style, setStyle } = useTheme()
```

`style` is one of `STYLES` (exported from `netix-frontend/theme`); the choice persists under
`netix-style`, so it follows a user across NETIX apps the same way the theme does. A stored value
that is not a shipped style is ignored. The template's `ThemeSwitcher` renders both axes as two
labelled groups in one menu.

## Adding a style

Add an entry to `styles` in `tokens/netix.tokens.json` with **every** alias the other styles
define (a generator test enforces that), then `pnpm build`. `STYLE_NAMES`, the `Style` type, the
CSS blocks and the switcher's options all follow from the token source; only the display label
needs a translation key.
