# Maintenance guidance

The system's version is this repository's git tag. Apps pin `netix-frontend` (tokens/theme/api) and the registry URL to a tag; nothing updates underneath them.

Canon, by layer:

- **Primitives** — the frontend-template's `app/components/ui` (base-nova on `@base-ui/react`) is the canonical set; upstream shadcn is the baseline. Ten NETIX-customized primitives (badge, button, dialog, field, input, label, popover, select, separator, skeleton) are mirrored verbatim in `registry/_fixtures/components/ui` — one directory that serves as both the test fixtures and the published `@netix/<name>` `registry:ui` sources, so composites always pull the NETIX versions instead of stock (the stock button lacks the danger/success intents and the loading prop; the template's Nova guardrail tests are the tripwire). Never edit the mirrors here: change the template first, then re-copy. When another primitive gains NETIX-specific behaviour, add it to the mirror set and switch its registryDependencies to `@netix/<name>`.
- **Composites and hooks** — `registry/netix/{components,hooks}` in this repo is canonical, tested here, and distributed only via the registry. Never re-add them as importable package exports.
- **Blocks** (`recipes`, `app-layout`, `app-sidebar`, `app-topbar`) — canonical here as snapshots of the template's shell; the template refreshes its copies with `shadcn add @netix/<block> --overwrite`. They are not unit-tested here (they assume an app's assets/i18n) — the template's own build and tests cover them.
- **Tokens and theme** — `tokens/netix.tokens.json` is the single source of truth; `pnpm gen:tokens` fans it out and CI's dist-drift gate keeps the committed artifacts honest.

When adopting a new upstream Base UI, shadcn, or Tailwind pattern, compare its accessibility and API behaviour with the local contract before copying it. Record visible changes in the component contract, update the design-system reference route when relevant, and run the guardrails plus focused tests.

Registry items must remain free of API, authentication, routing, page, and feature imports — the same product-infrastructure rule the template enforces on `app/components/ui`. App-specific layouts belong in recipes or feature folders.

Release order matters: tag the template first, update the CLI's pinned refs (`src/cli/refs.ts`), then tag this repo. Scaffolds inherit all three pins.
