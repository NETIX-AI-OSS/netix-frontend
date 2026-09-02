import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useCurrentUser } from './use-current-user'

const getUser = vi.fn()

vi.mock('envoy-ts-auth', () => ({
  Auth: { getInstance: () => ({ getUser }) },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

describe('useCurrentUser', () => {
  it('normalizes the shared auth response', async () => {
    getUser.mockResolvedValueOnce({ first_name: 'Ada', last_name: 'Lovelace' })
    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toMatchObject({ first_name: 'Ada', last_name: 'Lovelace' })
  })

  it('returns a null user for an invalid response', async () => {
    getUser.mockResolvedValueOnce({})
    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
  })
})
