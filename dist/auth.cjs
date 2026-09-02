'use strict';

// src/auth/current-user.ts
var strings = (value) => Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
var asRecord = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : null;
function normalizeGroups(record) {
  const detailed = asRecord(record.groups_detailed) ?? {};
  const names = strings(record.groups);
  const ordered = names.length ? names : Object.keys(detailed);
  return ordered.map((name) => ({
    name,
    permissions: strings(asRecord(detailed[name])?.permissions)
  }));
}
function normalizeCurrentUser(payload) {
  const record = asRecord(payload);
  if (!record) return null;
  const user = asRecord(record.user) ?? record;
  if (typeof user.first_name !== "string" && typeof user.email !== "string") return null;
  return {
    username: typeof user.username === "string" ? user.username : "",
    first_name: typeof user.first_name === "string" ? user.first_name : "",
    last_name: typeof user.last_name === "string" ? user.last_name : "",
    email: typeof user.email === "string" ? user.email : void 0,
    designation: typeof user.designation === "string" ? user.designation : void 0,
    isSuperuser: user.is_superuser === true,
    permissions: strings(user.permissions),
    groups: normalizeGroups(user)
  };
}

// src/auth/permissions.ts
function derivePermissions(user) {
  if (!user) return /* @__PURE__ */ new Set();
  return /* @__PURE__ */ new Set([...user.permissions, ...user.groups.flatMap((group) => group.permissions)]);
}
function hasPermission(user, code) {
  if (!user) return false;
  if (user.isSuperuser) return true;
  return derivePermissions(user).has(code);
}

exports.derivePermissions = derivePermissions;
exports.hasPermission = hasPermission;
exports.normalizeCurrentUser = normalizeCurrentUser;
