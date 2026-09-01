import { createHttpClient, createMutator } from 'netix-frontend/api'
import { LOCAL_DEV_DATA_SERVICE_BASE_URL } from './local-dev-urls'

export const DATA_SERVICE_BASE_URL =
  import.meta.env.VITE_DEV_MODE === 'true'
    ? LOCAL_DEV_DATA_SERVICE_BASE_URL
    : import.meta.env.VITE_DATA_SERVICE_BASE_URL

export const AXIOS_INSTANCE = createHttpClient({
  baseURL: DATA_SERVICE_BASE_URL,
  error: { clientName: 'data-service' },
  // retryServerErrors mirrors the fleet transport policy (5xx retried, opt-in as of netix-frontend v1.0.2).
  retry: { retryServerErrors: true },
})

/** Orval mutator for the generated data-service client. */
export const httpDataServiceClient = createMutator(AXIOS_INSTANCE)

export default httpDataServiceClient
