import { keepPreviousData, QueryClient } from '@tanstack/react-query'
import { createQueryRetryPolicy } from 'netix-frontend/api'

/**
 * The app-wide TanStack Query client. Retry rides the platform policy (retryable statuses
 * only, capped backoff, Retry-After aware); `keepPreviousData` keeps paginated tables from
 * flashing empty between pages. Opt out per query with `placeholderData: undefined`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
      ...createQueryRetryPolicy(),
    },
  },
})
