import { describe, expect, it } from 'vitest'

import { normalizeCurrentUser } from './current-user'

describe('normalizeCurrentUser', () => {
  it('rejects malformed payloads', () => {
    expect(normalizeCurrentUser(null)).toBeNull()
    expect(normalizeCurrentUser({ user: { username: 'missing profile fields' } })).toBeNull()
  })

  it('normalizes a nested payload and preserves group order', () => {
    expect(
      normalizeCurrentUser({
        user: {
          username: 'ada',
          first_name: 'Ada',
          last_name: 'Lovelace',
          email: 'ada@example.com',
          designation: 'Engineer',
          is_superuser: true,
          permissions: ['asset.view'],
          groups: ['operators'],
          groups_detailed: { operators: { permissions: ['asset.edit'] } },
        },
      }),
    ).toEqual({
      username: 'ada',
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      designation: 'Engineer',
      isSuperuser: true,
      permissions: ['asset.view'],
      groups: [{ name: 'operators', permissions: ['asset.edit'] }],
    })
  })

  it('uses detailed group keys when the payload has no group names', () => {
    expect(
      normalizeCurrentUser({
        first_name: 'Grace',
        groups_detailed: { admins: { permissions: ['user.view'] } },
      }),
    ).toMatchObject({ groups: [{ name: 'admins', permissions: ['user.view'] }] })
  })

  it('accepts an email-only profile and fills absent optional collections', () => {
    expect(normalizeCurrentUser({ email: 'grace@example.com' })).toEqual({
      username: '',
      first_name: '',
      last_name: '',
      email: 'grace@example.com',
      designation: undefined,
      isSuperuser: false,
      permissions: [],
      groups: [],
    })
  })
})
