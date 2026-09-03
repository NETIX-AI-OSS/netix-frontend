# Maintenance guidance

The system's version is this repository's git tag. Apps pin `netix-frontend` (tokens/theme/api) and the registry URL to a tag; nothing updates underneath them.

Canon, by layer:

- **Primitives** — `registry/netix/ui` is canonical for the eleven primitives required by current NETIX composites (badge, button, dialog, field, input, label, popover, select, separator, skeleton, table). The release template carries verbatim copies in `app/components/ui`; applications permanently own those copies after init. Upstream base-nova shadcn is the baseline. Add another primitive to @netix when a NETIX composite depends on it or NETIX customizes it.
- **Shared hooks** — `src/hooks` is canonical and imported as `netix-frontend/hooks`. Only generic, cross-app behaviour belongs there.
- **Composites** — `registry/netix/components` is canonical, tested here, and distributed only through the registry. Its items are UI components only; private hooks are colocated.
- **Application components** — `frontend-template/app/components/application/<name>` is canonical for layout, sidebar, topbar, language/theme switchers, command menu and auth UI. They reach an application once through `netix init`, never through the registry.
- **Tokens and theme** — `tokens/netix.tokens.json` is the single source of truth; `pnpm gen:tokens` fans it out and CI's dist-drift gate keeps the committed artifacts honest.

When adopting a new upstream Base UI, shadcn, or Tailwind pattern, compare its accessibility and API behaviour with the local contract before copying it. Record visible changes in the component contract, update the design-system reference route when relevant, and run the guardrails plus focused tests.

Registry items must remain free of API, authentication, routing, page, and feature imports — the same rule the template enforces on `app/components/ui`. App-specific components belong in named folders under `app/components/application` or beside their feature; do not create a recipes/shared/common catch-all.

Release order matters: update the CLI's pinned refs (`src/cli/refs.ts`) and tag this repo first, then point the template at the new library tag and tag the template. The template installs the library, so the library tag has to exist first; `refs.ts` only needs the template's tag name. Scaffolds inherit all three pins.
