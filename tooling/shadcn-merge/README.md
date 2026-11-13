# Shadcn configuration merge

Scoped pnpm overrides replace `deepmerge` only for the installed `shadcn` and
`@shadcn/registry` callers with `@fastify/deepmerge` 3.2.4. Fastify performs all
recursive merging, cloning and prototype-key filtering.

The adapter binds Fastify’s factory, retains enumerable symbol keys, maps
shadcn’s two-argument `arrayMerge` callback to Fastify’s `mergeArray` option,
and maps `.all(values)` to Fastify’s variadic merge with the legacy empty-object
initial value. Arrays concatenate by default; shadcn’s Tailwind and MCP config
updates replace them. Inputs to those custom callbacks retain their existing
semantics. Other legacy options fail explicitly. This is not a general-purpose
replacement for the entire old API; re-audit call sites when upgrading shadcn.

Run `pnpm test:shadcn-merge` to verify installed consumer resolution, local registry
dependency/CSS merging, CLI startup, array replacement, cloning and prototype-key
filtering. The legacy package must be absent from the lockfile.

This migration is a maintenance choice: CVE-2026-93753 was rejected on
2 November 2026 as not describing a security vulnerability.
