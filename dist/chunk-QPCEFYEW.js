import { derivePermissions } from './chunk-NHLN2CPH.js';
import { useMemo } from 'react';

function usePermissionsFrom(user, isLoading = false) {
  const resolved = user ?? null;
  const permissions = useMemo(() => derivePermissions(resolved), [resolved]);
  const isLoaded = !isLoading && !!resolved;
  return {
    user: resolved,
    permissions,
    isSuperuser: resolved?.isSuperuser === true,
    isLoaded,
    hasPermission: (code) => isLoaded && (resolved?.isSuperuser === true || permissions.has(code))
  };
}

export { usePermissionsFrom };
