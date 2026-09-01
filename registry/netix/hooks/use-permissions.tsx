import { type ReactNode, useMemo } from 'react'

export type PermissionGroup = { permissions?: unknown[] | null } | null | undefined

export type PermissionUser = {
  permissions?: unknown[] | null
  groups_detailed?: Record<string, PermissionGroup> | null
  is_superuser?: boolean | null
}

export type CurrentUserState = { user?: PermissionUser | null; isLoading?: boolean }

/** Apps bind this to envoy-ts-auth's current-user hook; the package never imports auth itself. */
export type UseCurrentUser = () => CurrentUserState

// Normalise a permission to its bare codename (envoy-ts-auth convention).
const toCodename = (permission: unknown): string => String(permission).replace(/^.*\./, '')

/** Unions the flat `permissions` array with per-group permissions into one set of bare codenames. */
export const derivePermissions = (user?: PermissionUser | null): Set<string> => {
  if (!user) return new Set<string>()

  const flat = Array.isArray(user.permissions) ? user.permissions : []
  const grouped = user.groups_detailed
    ? Object.values(user.groups_detailed).flatMap((group) =>
        Array.isArray(group?.permissions) ? group.permissions : [],
      )
    : []

  return new Set<string>([...flat, ...grouped].map(toCodename))
}

const useNoCurrentUser: UseCurrentUser = () => ({ user: null, isLoading: false })

let configuredUseCurrentUser: UseCurrentUser | undefined

export function configurePermissions(useCurrentUser: UseCurrentUser) {
  configuredUseCurrentUser = useCurrentUser
}

export type PermissionsOptions = {
  useCurrentUser?: UseCurrentUser
  /** asset-ui's documented contract — the backend enforces authoritatively; default is fail-closed. */
  failOpen?: boolean
}

export function usePermissions(options?: PermissionsOptions) {
  const useSource = options?.useCurrentUser ?? configuredUseCurrentUser ?? useNoCurrentUser
  const { user, isLoading } = useSource()

  const permissions = useMemo(() => derivePermissions(user), [user])
  const isSuperuser = Boolean(user?.is_superuser)
  const isLoaded = !isLoading && !!user

  const hasPermission = (code: string): boolean => {
    if (!isLoaded) return Boolean(options?.failOpen)
    if (isSuperuser) return true
    return permissions.has(code)
  }

  return { permissions, isSuperuser, isLoaded, hasPermission }
}

export type PermissionGateProps = PermissionsOptions & {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
  ...options
}: PermissionGateProps) {
  const { hasPermission } = usePermissions(options)
  return <>{hasPermission(permission) ? children : fallback}</>
}
