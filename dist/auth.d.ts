import { C as CurrentUser } from './current-user-B0Z0_kAv.js';
export { A as AccessGroup, n as normalizeCurrentUser } from './current-user-B0Z0_kAv.js';

/** Unions direct and group permissions into a stable, deduplicated set. */
declare function derivePermissions(user?: CurrentUser | null): Set<string>;
declare function hasPermission(user: CurrentUser | null | undefined, code: string): boolean;

export { CurrentUser, derivePermissions, hasPermission };
