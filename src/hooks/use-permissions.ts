import { derivePermissions } from 'netix-frontend/auth'
import { useMemo } from 'react'

import { useCurrentUser } from './use-current-user'

/** Permission state derived from the shared current-user contract; loading is fail-closed. */
export function usePermissions() {
  const { user, isLoading } = useCurrentUser()
  const permissions = useMemo(() => derivePermissions(user), [user])
  const isLoaded = !isLoading && !!user

  return {
    user,
    permissions,
    isSuperuser: user?.isSuperuser === true,
    isLoaded,
    hasPermission: (code: string) =>
      isLoaded && (user?.isSuperuser === true || permissions.has(code)),
  }
}
