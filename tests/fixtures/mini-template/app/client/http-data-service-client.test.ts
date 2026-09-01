import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it } from 'vitest'
import { AXIOS_INSTANCE } from './http-data-service-client'

/** Adapter that fails without touching the network, so the shared interceptors still run. */
function failWith(status: number, data: unknown) {
  return async (config: InternalAxiosRequestConfig) => {
    const response = {
      data,
      status,
      statusText: '',
      headers: new AxiosHeaders(),
      config,
    }
    throw new AxiosError('Request failed', String(status), config, {}, response)
  }
}

describe('data-service client', () => {
  it('maps an error envelope onto ApiError', async () => {
    await expect(
      AXIOS_INSTANCE.get('/x', {
        adapter: failWith(400, { messages: ['Bad thing'] }),
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 400,
      messages: ['Bad thing'],
      context: { client: 'data-service' },
    })
  })

  it('throws instead of logging out on 403', async () => {
    await expect(AXIOS_INSTANCE.get('/x', { adapter: failWith(403, {}) })).rejects.toMatchObject({
      statusCode: 403,
      messages: ['You do not have permission to perform this action'],
    })
  })

  it('reports a response-less failure as status 0', async () => {
    const adapter = async (config: InternalAxiosRequestConfig) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    }
    // POST is not idempotent, so the transport retry does not re-dispatch it.
    await expect(AXIOS_INSTANCE.post('/x', {}, { adapter })).rejects.toMatchObject({
      statusCode: 0,
      messages: ['Network error occurred'],
    })
  })
})
