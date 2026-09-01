# NETIX web design system

This repository is the canonical source for NETIX web UI, split along one rule:

- **Imported, never ejected** — design tokens, the global stylesheet, the theme runtime, and the tool presets ship from this package (`netix-frontend/styles.css`, `netix-frontend/tokens.css`, `netix-frontend/theme`, `netix-frontend/presets/*`). A token change lands everywhere on the next version bump; apps cannot fork it.
- **Copied, never imported** — UI primitives, composites, hooks, and app-shell blocks are source files an app owns. Stock shadcn primitives (style `base-nova`, backed by `@base-ui/react`) come from the official shadcn registry; everything NETIX-specific comes from the **@netix registry** served by this repo (`shadcn add @netix/<item>`, or `netix add <item>`). A registry update can never silently break an app — apps take updates by re-running `add`.

The system uses React 19, Vite, Tailwind CSS v4, base-nova shadcn/ui primitives on `@base-ui/react`, semantic Nova tokens, and one restrained light/dark theme. It is for web React applications only. New apps start from `npx github:NETIX-AI-OSS/netix-frontend init` — the scaffold arrives already wired.

Start with the [registry guide](registry-guide.md), then use a scaffolded app's `/foundations/design-system` route as the working visual reference: semantic tokens, component states, keyboard focus, data-display patterns, toast and overlay behaviour, and an RTL smoke test.

In an app, the local source is the contract. Keep UI primitives in `app/components/ui`, page-level compositions in `app/components/recipes`, and app-specific behaviour in feature components. Before changing a primitive, update its documented contract, the reference route when a visible behaviour changes, and the focused test or guardrail that protects it.

See [component contracts](component-contracts.md), [page recipes](page-recipes.md), [migration guidance](migration-guide.md), and [maintenance guidance](governance.md).
