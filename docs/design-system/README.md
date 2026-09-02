# NETIX web design system

This repository is the canonical source for NETIX web UI, split along one rule:

- **Imported, never ejected** — shared logic and runtime contracts: API/auth, shared hooks, design tokens, the global stylesheet, theme, i18n, utilities, and tool presets.
- **Copied, never imported** — UI primitives and reusable composites. Stock shadcn primitives (style `base-nova`, backed by `@base-ui/react`) come from the official shadcn registry; NETIX-specific components come from **@netix** (`shadcn add @netix/<item>`, or `netix add <item>`). The registry contains components only. The app shell and pages arrive from frontend-template and stay application code.

The system uses React 19, Vite, Tailwind CSS v4, base-nova shadcn/ui primitives on `@base-ui/react`, semantic Nova tokens, and one restrained light/dark theme. It is for web React applications only. New apps start from `npx github:NETIX-AI-OSS/netix-frontend init` — the scaffold arrives already wired.

Start with the [registry guide](registry-guide.md), then use a scaffolded app's `/workspace/design-system` route as the working visual reference: semantic tokens, component states, keyboard focus, data-display patterns, toast and overlay behaviour, and an RTL smoke test.

In an app, the local source is the contract: registry primitives live in `app/components/ui`, registry composites in `app/components/composites/<name>`, and template-owned application components in `app/components/application/<name>`. Every non-primitive component uses a folder. Feature-specific code stays beside its module. There is no recipe layer or generic component junk drawer.

Appearance has two independent axes: light/dark/system, and the **design style** — component shape. Nova (the default) and Rhea (pill controls, softer panels) ship today; see [design styles](styles.md).

See [component contracts](component-contracts.md), [component structure](component-structure.md), [design styles](styles.md), [migration guidance](migration-guide.md), and [maintenance guidance](governance.md).
