/**
 * The app's token seam: service clients and the locale runtime read the session
 * token through this one function. Side-effect free on purpose — envoy-ts-auth
 * is initialized by `@/lib/auth-init` (imported first in main.tsx); before that,
 * or under test, this resolves null and requests simply carry no bearer header.
 */
import { Auth } from 'envoy-ts-auth'

export async function getAccessToken(): Promise<string | null> {
  try {
    return await Auth.getInstance().getToken()
  } catch {
    return null
  }
}
