import type { CurrentUser } from 'netix-frontend/auth'
import { derivePermissions } from 'netix-frontend/auth'
import { useMemo } from 'react'

export type PermissionsState = {
  user: CurrentUser | null
  permissions: Set<string>
  isSuperuser: boolean
  isLoaded: boolean
  hasPermission: (code: string) => boolean
}

/**
 * Permission state over a user the caller already fetched, with no opinion on how.
 * `usePermissions` is this hook plus the TanStack Query `useCurrentUser`; apps on SWR, a
 * context, or a bare promise pass their own user here instead of re-deriving the union.
 * Loading is fail-closed: nothing is granted until a user has actually arrived.
 */
export function usePermissionsFrom(
  user: CurrentUser | null | undefined,
  isLoading = false,
): PermissionsState {
  const resolved = user ?? null
  const permissions = useMemo(() => derivePermissions(resolved), [resolved])
  const isLoaded = !isLoading && !!resolved

  return {
    user: resolved,
    permissions,
    isSuperuser: resolved?.isSuperuser === true,
    isLoaded,
    hasPermission: (code: string) =>
      isLoaded && (resolved?.isSuperuser === true || permissions.has(code)),
  }
}
