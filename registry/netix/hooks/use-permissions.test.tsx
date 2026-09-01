import { render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  configurePermissions,
  derivePermissions,
  PermissionGate,
  type PermissionUser,
  type UseCurrentUser,
  usePermissions,
} from './use-permissions'

const USER: PermissionUser = {
  permissions: ['assets.view_asset'],
  groups_detailed: {
    techs: { permissions: ['cafm.change_workorder'] },
    empty: null,
    odd: { permissions: null },
  },
}

const source =
  (state: { user?: PermissionUser | null; isLoading?: boolean }): UseCurrentUser =>
  () =>
    state

describe('derivePermissions', () => {
  it('unions flat and group grants as bare codenames', () => {
    expect([...derivePermissions(USER)]).toEqual(['view_asset', 'change_workorder'])
  })

  it('is empty without a user or without grants', () => {
    expect(derivePermissions().size).toBe(0)
    expect(derivePermissions(null).size).toBe(0)
    expect(derivePermissions({ permissions: null }).size).toBe(0)
  })
})

describe('usePermissions', () => {
  it('fails closed while the user is loading', () => {
    const { result } = renderHook(() =>
      usePermissions({ useCurrentUser: source({ isLoading: true }) }),
    )
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.hasPermission('view_asset')).toBe(false)
  })

  it('fails open only when asked', () => {
    const { result } = renderHook(() =>
      usePermissions({ useCurrentUser: source({ isLoading: true }), failOpen: true }),
    )
    expect(result.current.hasPermission('view_asset')).toBe(true)
  })

  it('checks the derived set once loaded', () => {
    const { result } = renderHook(() => usePermissions({ useCurrentUser: source({ user: USER }) }))
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isSuperuser).toBe(false)
    expect(result.current.hasPermission('view_asset')).toBe(true)
    expect(result.current.hasPermission('delete_asset')).toBe(false)
  })

  it('lets superusers through', () => {
    const { result } = renderHook(() =>
      usePermissions({ useCurrentUser: source({ user: { is_superuser: true } }) }),
    )
    expect(result.current.hasPermission('anything')).toBe(true)
  })

  it('denies everything until a user source is configured', () => {
    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('view_asset')).toBe(false)

    configurePermissions(source({ user: USER }))
    const configured = renderHook(() => usePermissions())
    expect(configured.result.current.hasPermission('view_asset')).toBe(true)
  })
})

describe('PermissionGate', () => {
  it('renders children only for a granted permission', () => {
    render(
      <PermissionGate permission="view_asset" useCurrentUser={source({ user: USER })}>
        <p>secret</p>
      </PermissionGate>,
    )
    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('renders the fallback otherwise', () => {
    const { container } = render(
      <PermissionGate permission="delete_asset" useCurrentUser={source({ user: USER })}>
        <p>secret</p>
      </PermissionGate>,
    )
    expect(container).toBeEmptyDOMElement()

    render(
      <PermissionGate
        permission="delete_asset"
        fallback={<p>denied</p>}
        useCurrentUser={source({ user: USER })}
      >
        <p>secret</p>
      </PermissionGate>,
    )
    expect(screen.getByText('denied')).toBeInTheDocument()
  })
})
