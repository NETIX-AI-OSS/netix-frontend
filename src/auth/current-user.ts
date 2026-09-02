/** A permission group as returned by the shared user service. */
export type AccessGroup = {
  name: string
  permissions: string[]
}

/** The normalized current-user shape shared by every NETIX web application. */
export type CurrentUser = {
  username: string
  first_name: string
  last_name: string
  email?: string
  designation?: string
  isSuperuser: boolean
  permissions: string[]
  groups: AccessGroup[]
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

function normalizeGroups(record: Record<string, unknown>): AccessGroup[] {
  const detailed = asRecord(record.groups_detailed) ?? {}
  const names = strings(record.groups)
  const ordered = names.length ? names : Object.keys(detailed)

  return ordered.map((name) => ({
    name,
    permissions: strings(asRecord(detailed[name])?.permissions),
  }))
}

/** `/auth/me/` may nest the user; malformed payloads are rejected rather than leaked. */
export function normalizeCurrentUser(payload: unknown): CurrentUser | null {
  const record = asRecord(payload)
  if (!record) return null

  const user = asRecord(record.user) ?? record
  if (typeof user.first_name !== 'string' && typeof user.email !== 'string') return null

  return {
    username: typeof user.username === 'string' ? user.username : '',
    first_name: typeof user.first_name === 'string' ? user.first_name : '',
    last_name: typeof user.last_name === 'string' ? user.last_name : '',
    email: typeof user.email === 'string' ? user.email : undefined,
    designation: typeof user.designation === 'string' ? user.designation : undefined,
    isSuperuser: user.is_superuser === true,
    permissions: strings(user.permissions),
    groups: normalizeGroups(user),
  }
}
