import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import type { DevTokenManager } from './dev-token'
import { createErrorInterceptor, type ErrorInterceptorConfig } from './error-interceptor'
import { createParamsSerializer, type ParamsSerializerStrategy } from './params'
import { attachRetryInterceptor, type RetryOptions } from './retry'

export type MaybePromise<T> = T | Promise<T>

export type HttpClientConfig = {
  baseURL?: string
  /** Read per request, never cached: the mobile apps repoint themselves from the sign-in screen. */
  getBaseURL?: () => string
  timeout?: number
  headers?: Record<string, string>
  paramsSerializer?: ParamsSerializerStrategy
  getToken?: () => MaybePromise<string | null | undefined>
  devTokens?: DevTokenManager
  /** Replaces the default auth request interceptor wholesale. */
  requestInterceptor?: (
    config: InternalAxiosRequestConfig,
  ) => MaybePromise<InternalAxiosRequestConfig>
  error?: ErrorInterceptorConfig | false
  retry?: RetryOptions | false
}

function createAuthRequestInterceptor(config: HttpClientConfig) {
  const { getBaseURL, getToken, devTokens } = config

  return async (request: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    if (getBaseURL) request.baseURL = getBaseURL()

    const devToken = devTokens?.shouldUseDevToken(request) ? await devTokens.getToken() : null
    const token = devToken ?? (await getToken?.())
    // Only set the header when a token exists, so an unauthenticated call is not sent `Bearer `.
    if (token) request.headers.Authorization = `Bearer ${token}`

    return request
  }
}

export function createHttpClient(config: HttpClientConfig = {}): AxiosInstance {
  const instance = Axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: { 'Content-Type': 'application/json', ...config.headers },
    paramsSerializer: createParamsSerializer(config.paramsSerializer),
  })

  instance.interceptors.request.use(
    config.requestInterceptor ?? createAuthRequestInterceptor(config),
  )

  // Retry first so it observes the raw AxiosError; the error mapping runs last.
  if (config.retry !== false) attachRetryInterceptor(instance, config.retry)
  if (config.error !== false) {
    const { onSuccess, onError } = createErrorInterceptor(config.error)
    instance.interceptors.response.use(onSuccess, onError)
  }

  return instance
}

/** Orval mutator: `<T>(config, options?) => Promise<T>`, client-agnostic for SWR and react-query alike. */
export function createMutator(instance: AxiosInstance) {
  return async <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
    const { data } = await instance({ ...config, ...options })
    return data as T
  }
}
