import { spawn } from 'node:child_process'

import { SHADCN_VERSION } from '../refs'

/** `netix add x` → `@netix/x`; names that already carry a registry or path pass through. */
export function qualifyItems(items: string[]): string[] {
  return items.map((item) =>
    item.startsWith('@') || item.includes('/') || item.includes(':') ? item : `@netix/${item}`,
  )
}

/**
 * Thin wrapper over the pinned shadcn CLI. The app's components.json (written by
 * `netix init`) maps the @netix namespace to this repo's registry. Only `netix add`
 * reaches for it: scaffolding never fetches, because frontend-template already ships
 * the components a scaffolded app renders.
 */
export function addItems(items: string[], passthrough: string[] = []): Promise<number> {
  const args = ['dlx', `shadcn@${SHADCN_VERSION}`, 'add', ...qualifyItems(items), ...passthrough]
  return new Promise((resolve) => {
    const child = spawn('pnpm', args, { stdio: 'inherit' })
    child.on('close', (code) => resolve(code ?? 1))
    child.on('error', () => resolve(1))
  })
}
