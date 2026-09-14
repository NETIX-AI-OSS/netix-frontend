import { C as CurrentUser } from '../current-user-B0Z0_kAv.cjs';

type PermissionsState = {
    user: CurrentUser | null;
    permissions: Set<string>;
    isSuperuser: boolean;
    isLoaded: boolean;
    hasPermission: (code: string) => boolean;
};
/**
 * Permission state over a user the caller already fetched, with no opinion on how.
 * `usePermissions` is this hook plus the TanStack Query `useCurrentUser`; apps on SWR, a
 * context, or a bare promise pass their own user here instead of re-deriving the union.
 * Loading is fail-closed: nothing is granted until a user has actually arrived.
 */
declare function usePermissionsFrom(user: CurrentUser | null | undefined, isLoading?: boolean): PermissionsState;

export { type PermissionsState, usePermissionsFrom };
