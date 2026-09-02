import { describe, expect, it } from 'vitest'

import type { CurrentUser } from './current-user'
import { derivePermissions, hasPermission } from './permissions'

const user: CurrentUser = {
  username: 'ada',
  first_name: 'Ada',
  last_name: 'Lovelace',
  isSuperuser: false,
  permissions: ['asset.view'],
  groups: [{ name: 'operators', permissions: ['asset.edit'] }],
}

describe('permissions', () => {
  it('unions direct and group permissions', () => {
    expect([...derivePermissions(user)]).toEqual(['asset.view', 'asset.edit'])
    expect(derivePermissions(null)).toEqual(new Set())
  })

  it('supports normal users and superusers', () => {
    expect(hasPermission(user, 'asset.view')).toBe(true)
    expect(hasPermission(user, 'user.delete')).toBe(false)
    expect(hasPermission({ ...user, isSuperuser: true }, 'user.delete')).toBe(true)
    expect(hasPermission(null, 'asset.view')).toBe(false)
  })
})
