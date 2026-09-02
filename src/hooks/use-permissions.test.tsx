import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { usePermissions } from './use-permissions'

const getUser = vi.fn()

vi.mock('envoy-ts-auth', () => ({
  Auth: { getInstance: () => ({ getUser }) },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

describe('usePermissions', () => {
  it('fails closed while loading, then exposes direct and group permissions', async () => {
    getUser.mockResolvedValueOnce({
      first_name: 'Ada',
      permissions: ['asset.view'],
      groups: ['operators'],
      groups_detailed: { operators: { permissions: ['asset.edit'] } },
    })
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.hasPermission('asset.view')).toBe(false)
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.hasPermission('asset.view')).toBe(true)
    expect(result.current.hasPermission('asset.edit')).toBe(true)
    expect(result.current.hasPermission('user.delete')).toBe(false)
  })
})
