import { useQuery } from '@tanstack/react-query'
import { Auth } from 'envoy-ts-auth'
import { normalizeCurrentUser } from 'netix-frontend/auth'

/** The shared signed-in user query used by shell, permissions and feature code. */
export function useCurrentUser() {
  const { data, isPending } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => normalizeCurrentUser(await Auth.getInstance().getUser()),
    staleTime: Infinity,
    retry: false,
  })

  return { user: data ?? null, isLoading: isPending }
}
