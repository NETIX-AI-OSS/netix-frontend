import { usePermissionsFrom } from './permissions'
import { useCurrentUser } from './use-current-user'

/** Permission state derived from the shared current-user contract; loading is fail-closed. */
export function usePermissions() {
  const { user, isLoading } = useCurrentUser()
  return usePermissionsFrom(user, isLoading)
}
