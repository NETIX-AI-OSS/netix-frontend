'use strict';

var react = require('react');

// src/auth/permissions.ts
function derivePermissions(user) {
  if (!user) return /* @__PURE__ */ new Set();
  return /* @__PURE__ */ new Set([...user.permissions, ...user.groups.flatMap((group) => group.permissions)]);
}
function usePermissionsFrom(user, isLoading = false) {
  const resolved = user ?? null;
  const permissions = react.useMemo(() => derivePermissions(resolved), [resolved]);
  const isLoaded = !isLoading && !!resolved;
  return {
    user: resolved,
    permissions,
    isSuperuser: resolved?.isSuperuser === true,
    isLoaded,
    hasPermission: (code) => isLoaded && (resolved?.isSuperuser === true || permissions.has(code))
  };
}

exports.usePermissionsFrom = usePermissionsFrom;
