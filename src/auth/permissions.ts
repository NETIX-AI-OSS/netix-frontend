import type { CurrentUser } from './current-user'

/** Unions direct and group permissions into a stable, deduplicated set. */
export function derivePermissions(user?: CurrentUser | null): Set<string> {
  if (!user) return new Set<string>()

  return new Set([...user.permissions, ...user.groups.flatMap((group) => group.permissions)])
}

export function hasPermission(user: CurrentUser | null | undefined, code: string): boolean {
  if (!user) return false
  if (user.isSuperuser) return true
  return derivePermissions(user).has(code)
}
