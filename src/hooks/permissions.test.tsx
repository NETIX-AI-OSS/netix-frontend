import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { CurrentUser } from '../auth'
import { usePermissionsFrom } from './permissions'

const user = {
  id: 1,
  firstName: 'Ada',
  lastName: '',
  email: '',
  isSuperuser: false,
  permissions: ['asset.view'],
  groups: [{ name: 'operators', permissions: ['asset.edit'] }],
} as unknown as CurrentUser

describe('usePermissionsFrom', () => {
  it('unions direct and group permissions for a user the caller fetched', () => {
    const { result } = renderHook(() => usePermissionsFrom(user))
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.permissions).toEqual(new Set(['asset.view', 'asset.edit']))
    expect(result.current.hasPermission('asset.view')).toBe(true)
    expect(result.current.hasPermission('asset.edit')).toBe(true)
    expect(result.current.hasPermission('user.delete')).toBe(false)
    expect(result.current.isSuperuser).toBe(false)
  })

  it('fails closed while loading and with no user', () => {
    const loading = renderHook(() => usePermissionsFrom(user, true))
    expect(loading.result.current.isLoaded).toBe(false)
    expect(loading.result.current.hasPermission('asset.view')).toBe(false)

    const anonymous = renderHook(() => usePermissionsFrom(null))
    expect(anonymous.result.current.user).toBeNull()
    expect(anonymous.result.current.permissions.size).toBe(0)
    expect(anonymous.result.current.hasPermission('asset.view')).toBe(false)

    // undefined is normalized to null, so callers can pass an unsettled value straight through.
    const unsettled = renderHook(() => usePermissionsFrom(undefined))
    expect(unsettled.result.current.user).toBeNull()
    expect(unsettled.result.current.isLoaded).toBe(false)
  })

  it('grants everything to a superuser', () => {
    const { result } = renderHook(() => usePermissionsFrom({ ...user, isSuperuser: true }))
    expect(result.current.isSuperuser).toBe(true)
    expect(result.current.hasPermission('anything.at.all')).toBe(true)
  })
})
