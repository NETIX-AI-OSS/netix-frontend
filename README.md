# netix-frontend

NETIX's shared frontend library: one package, one version, subpath entry points.

| Entry point                | Contents                                                                                              | Platforms |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | --------- |
| `netix-frontend/api`       | axios client factory, error interceptor, ApiError, retry, envelope parser, dev tokens, Sentry filters | web + RN  |
| `netix-frontend/hooks`     | shared React hooks (pagination, filters, permissions, …)                                              | web + RN  |
| `netix-frontend/utils`     | cn, date, formatters, misc utils                                                                      | web + RN  |
| `netix-frontend/utils/dom` | file download/upload, lazyWithRetry                                                                   | web only  |
| `netix-frontend/i18n`      | i18next bootstrap, organization locale runtime, common namespace                                      | web + RN  |
| `netix-frontend/ui`        | shadcn-based component set + `ui/styles.css`                                                          | web only  |
| `netix-frontend/tokens`    | design tokens: `tokens.css` (tailwind v4), `preset` (v3), `vars.css` (plain CSS), theme init          | web only  |
| `netix-frontend/presets/*` | eslint / tsconfig / prettier presets                                                                  | tooling   |

Install by immutable tag:

```json
"netix-frontend": "github:NETIX-AI-OSS/netix-frontend#v1.0.0"
```

`dist/` is committed (no `prepare` script) so installs need zero consumer configuration; CI gates dist drift.

## Develop

```bash
pnpm install
pnpm build        # tokens + tsup + css
pnpm test         # vitest, 100% coverage on api/utils/hooks/i18n
pnpm lint && pnpm typecheck && pnpm format:check
```

Releases: bump `version`, tag `vX.Y.Z` (immutable via ruleset), GitHub release. The release workflow asserts tag == package version.
