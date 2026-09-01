# Maintenance guidance

The system's version is this repository's git tag. Apps pin `netix-frontend` (tokens/theme/api) and the registry URL to a tag; nothing updates underneath them.

Canon, by layer:

- **Primitives** — the frontend-template's `app/components/ui` (base-nova on `@base-ui/react`) is the canonical set; upstream shadcn is the baseline. This repo keeps verbatim copies only as test fixtures (`registry/_fixtures`) — never edit them here; change the template first, then refresh the fixtures. If a primitive ever needs NETIX-specific behaviour, promote that one file into the @netix registry as a `registry:ui` item and reference it as `@netix/<name>` — that is the escape hatch, and the template's Nova guardrail tests are the tripwire that says when it happened.
- **Composites and hooks** — `registry/netix/{components,hooks}` in this repo is canonical, tested here, and distributed only via the registry. Never re-add them as importable package exports.
- **Blocks** (`recipes`, `app-layout`, `app-sidebar`, `app-topbar`) — canonical here as snapshots of the template's shell; the template refreshes its copies with `shadcn add @netix/<block> --overwrite`. They are not unit-tested here (they assume an app's assets/i18n) — the template's own build and tests cover them.
- **Tokens and theme** — `tokens/netix.tokens.json` is the single source of truth; `pnpm gen:tokens` fans it out and CI's dist-drift gate keeps the committed artifacts honest.

When adopting a new upstream Base UI, shadcn, or Tailwind pattern, compare its accessibility and API behaviour with the local contract before copying it. Record visible changes in the component contract, update the design-system reference route when relevant, and run the guardrails plus focused tests.

Registry items must remain free of API, authentication, routing, page, and feature imports — the same product-infrastructure rule the template enforces on `app/components/ui`. App-specific layouts belong in recipes or feature folders.

Release order matters: tag the template first, update the CLI's pinned refs (`src/cli/refs.ts`), then tag this repo. Scaffolds inherit all three pins.
