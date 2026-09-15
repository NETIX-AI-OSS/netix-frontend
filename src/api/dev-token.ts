import Axios, { type AxiosInstance } from 'axios'

export type DevTokenConfig = {
  /** Injected, never read from import.meta — the RN-safe entries must stay bundler-agnostic. */
  devMode: boolean
  username?: string
  password?: string
  /** Test runs must never fire the dev-token request (user-profile-ui's guard, folded in). */
  isTest?: boolean
  baseURL: string
  tokenEndpoint?: string
  /** Injected in tests; defaults to a bare axios instance on `baseURL`. */
  http?: Pick<AxiosInstance, 'post'>
  onWarn?: (message: string, error?: unknown) => void
}

export type DevTokenManager = {
  isEnabled: () => boolean
  shouldUseDevToken: (request?: { url?: string }) => boolean
  getToken: () => Promise<string | null>
  getCachedToken: () => string | null
  reset: () => void
}

/** Local-development token issuer: one promise-locked copy replacing the fleet's seven. */
export function createDevTokenManager(config: DevTokenConfig): DevTokenManager {
  const {
    devMode,
    username,
    password,
    isTest = false,
    baseURL,
    tokenEndpoint = '/auth/token/',
    onWarn,
  } = config

  let client = config.http
  let cachedToken: string | null = null
  let pending: Promise<string | null> | null = null

  const isEnabled = () => Boolean(devMode && username && password && !isTest)

  const getClient = () =>
    (client ??= Axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } }))

  const obtain = async (): Promise<string | null> => {
    try {
      const response = await getClient().post(tokenEndpoint, { username, password })
      const token = (response as { data?: { access?: string } }).data?.access
      if (!token) {
        onWarn?.(`No access token in the ${tokenEndpoint} response`)
        return null
      }
      return token
    } catch (error) {
      onWarn?.('Failed to obtain a dev token', error)
      return null
    }
  }

  return {
    isEnabled,
    shouldUseDevToken: (request = {}) => {
      if (!isEnabled()) return false
      const url = request.url ?? ''
      return !url.includes('/auth/login/') && !url.includes('/auth/token/')
    },
    getToken: async () => {
      if (!isEnabled()) return null
      if (cachedToken) return cachedToken
      pending ??= obtain().then((token) => {
        cachedToken = token
        pending = null
        return token
      })
      return pending
    },
    getCachedToken: () => cachedToken,
    reset: () => {
      cachedToken = null
      pending = null
    },
  }
}
