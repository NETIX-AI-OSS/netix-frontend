import type { AxiosAdapter, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { ApiError } from './errors'
import { createHttpClient, createMutator, type HttpClientConfig } from './http-client'

/** Echoes the resolved request config back as the response body. */
const echoAdapter: AxiosAdapter = (config) =>
  Promise.resolve({
    status: 200,
    statusText: 'OK',
    data: config,
    headers: {},
    config,
  } as AxiosResponse)

function echoing(config: HttpClientConfig = {}) {
  const instance = createHttpClient(config)
  instance.defaults.adapter = echoAdapter
  return instance
}

async function sent(instance: AxiosInstance, url = '/things') {
  const { data } = await instance.get<InternalAxiosRequestConfig>(url)
  return data
}

describe('createHttpClient', () => {
  it('applies the base URL, timeout and headers', async () => {
    const instance = echoing({
      baseURL: 'https://api.example.com/',
      timeout: 30_000,
      headers: { 'X-App': 'viz' },
    })

    const config = await sent(instance)

    expect(instance.defaults.timeout).toBe(30_000)
    expect(config.baseURL).toBe('https://api.example.com/')
    expect(config.headers['Content-Type']).toBe('application/json')
    expect(config.headers['X-App']).toBe('viz')
  })

  it('resolves the base URL per request when a resolver is given', async () => {
    const getBaseURL = vi.fn().mockReturnValue('https://staging.example.com/')
    const instance = echoing({ baseURL: 'https://api.example.com/', getBaseURL })

    expect((await sent(instance)).baseURL).toBe('https://staging.example.com/')

    getBaseURL.mockReturnValue('https://prod.example.com/')
    expect((await sent(instance)).baseURL).toBe('https://prod.example.com/')
  })

  it('attaches a bearer token, and nothing at all when there is none', async () => {
    expect((await sent(echoing({ getToken: () => 'tok' }))).headers.Authorization).toBe(
      'Bearer tok',
    )
    expect(
      (await sent(echoing({ getToken: async () => null }))).headers.Authorization,
    ).toBeUndefined()
    expect((await sent(echoing())).headers.Authorization).toBeUndefined()
  })

  it('takes a wholesale request-interceptor override', async () => {
    const requestInterceptor = vi.fn((config: InternalAxiosRequestConfig) => {
      config.headers.Authorization = 'Token custom'
      return config
    })

    const config = await sent(echoing({ requestInterceptor, getToken: () => 'tok' }))

    expect(config.headers.Authorization).toBe('Token custom')
    expect(requestInterceptor).toHaveBeenCalledTimes(1)
  })

  it('serializes params with the requested strategy', async () => {
    const instance = echoing({ paramsSerializer: 'comma' })

    const { data } = await instance.get<InternalAxiosRequestConfig>('/things', {
      params: { asset: [1, 2] },
    })

    const serializer = data.paramsSerializer as {
      serialize: (params: Record<string, unknown>) => string
    }

    expect(serializer.serialize({ asset: [1, 2] })).toBe('asset=1,2')
  })

  it('maps failures to ApiError by default', async () => {
    const instance = createHttpClient({ retry: false })
    instance.defaults.adapter = () =>
      Promise.reject(
        Object.assign(new Error('Request failed'), {
          isAxiosError: true,
          config: {},
          response: {
            status: 404,
            statusText: 'Not Found',
            data: { messages: 'Gone.' },
            headers: {},
          },
        }),
      )

    await expect(instance.get('/things')).rejects.toBeInstanceOf(ApiError)
    await expect(instance.get('/things')).rejects.toMatchObject({
      statusCode: 404,
      messages: ['Gone.'],
    })
  })

  it('leaves the raw rejection alone when error mapping is off', async () => {
    const failure = Object.assign(new Error('raw'), { isAxiosError: true, config: {} })
    const instance = createHttpClient({ error: false, retry: false })
    instance.defaults.adapter = () => Promise.reject(failure)

    await expect(instance.get('/things')).rejects.toBe(failure)
  })

  it('retries by default and not at all when retry is off', async () => {
    const attempts = vi.fn()
    const failing: AxiosAdapter = (config) => {
      attempts()
      return Promise.reject(
        Object.assign(new Error('Request failed with status code 429'), {
          isAxiosError: true,
          config,
          response: { status: 429, statusText: '', data: {}, headers: {}, config },
        }),
      )
    }

    const retrying = createHttpClient({ retry: { scheduleRetry: (callback) => callback() } })
    retrying.defaults.adapter = failing
    await expect(retrying.get('/things')).rejects.toBeInstanceOf(ApiError)
    expect(attempts).toHaveBeenCalledTimes(3)

    attempts.mockClear()
    const plain = createHttpClient({ retry: false })
    plain.defaults.adapter = failing
    await expect(plain.get('/things')).rejects.toBeInstanceOf(ApiError)
    expect(attempts).toHaveBeenCalledTimes(1)
  })
})

describe('createMutator', () => {
  it('unwraps the response body and merges orval’s second argument', async () => {
    const instance = echoing()
    const mutator = createMutator(instance)

    const config = await mutator<InternalAxiosRequestConfig>(
      { url: '/things', method: 'get' },
      { headers: { 'X-Extra': '1' } },
    )

    expect(config.url).toBe('/things')
    expect(config.headers['X-Extra']).toBe('1')
  })
})
