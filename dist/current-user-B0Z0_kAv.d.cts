/** A permission group as returned by the shared user service. */
type AccessGroup = {
    name: string;
    permissions: string[];
};
/** The normalized current-user shape shared by every NETIX web application. */
type CurrentUser = {
    username: string;
    first_name: string;
    last_name: string;
    email?: string;
    designation?: string;
    isSuperuser: boolean;
    permissions: string[];
    groups: AccessGroup[];
};
/** `/auth/me/` may nest the user; malformed payloads are rejected rather than leaked. */
declare function normalizeCurrentUser(payload: unknown): CurrentUser | null;

export { type AccessGroup as A, type CurrentUser as C, normalizeCurrentUser as n };
