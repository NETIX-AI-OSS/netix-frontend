import Axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDevTokenManager, type DevTokenConfig } from './dev-token'

const enabled: DevTokenConfig = {
  devMode: true,
  username: 'dev',
  password: 'dev',
  baseURL: 'http://localhost:8001/',
}

function managerWith(post: ReturnType<typeof vi.fn>, overrides: Partial<DevTokenConfig> = {}) {
  return createDevTokenManager({
    ...enabled,
    http: { post } as DevTokenConfig['http'],
    ...overrides,
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('the enable gate', () => {
  it.each([
    ['dev mode is off', { devMode: false }],
    ['the username is missing', { username: '' }],
    ['the password is missing', { password: undefined }],
    ['the run is a test run', { isTest: true }],
  ])('stays off when %s', async (_label, overrides) => {
    const post = vi.fn()
    const manager = managerWith(post, overrides)

    expect(manager.isEnabled()).toBe(false)
    expect(manager.shouldUseDevToken({ url: '/assets/' })).toBe(false)
    await expect(manager.getToken()).resolves.toBeNull()
    expect(post).not.toHaveBeenCalled()
  })

  it('is on when dev mode, credentials and a non-test run line up', () => {
    expect(managerWith(vi.fn()).isEnabled()).toBe(true)
  })
})

describe('shouldUseDevToken', () => {
  it('skips the auth endpoints themselves', () => {
    const manager = managerWith(vi.fn())

    expect(manager.shouldUseDevToken()).toBe(true)
    expect(manager.shouldUseDevToken({})).toBe(true)
    expect(manager.shouldUseDevToken({ url: '/assets/' })).toBe(true)
    expect(manager.shouldUseDevToken({ url: '/auth/token/' })).toBe(false)
    expect(manager.shouldUseDevToken({ url: '/auth/login/' })).toBe(false)
  })
})

describe('getToken', () => {
  it('posts the credentials once and caches the access token', async () => {
    const post = vi.fn().mockResolvedValue({ data: { access: 'tok' } })
    const manager = managerWith(post)

    await expect(manager.getToken()).resolves.toBe('tok')
    await expect(manager.getToken()).resolves.toBe('tok')

    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenCalledWith('/auth/token/', { username: 'dev', password: 'dev' })
    expect(manager.getCachedToken()).toBe('tok')
  })

  it('locks concurrent callers onto one request', async () => {
    const post = vi.fn().mockResolvedValue({ data: { access: 'tok' } })
    const manager = managerWith(post)

    await expect(Promise.all([manager.getToken(), manager.getToken()])).resolves.toEqual([
      'tok',
      'tok',
    ])
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('honors a custom token endpoint', async () => {
    const post = vi.fn().mockResolvedValue({ data: { access: 'tok' } })

    await managerWith(post, { tokenEndpoint: '/api/token/' }).getToken()

    expect(post).toHaveBeenCalledWith('/api/token/', expect.anything())
  })

  it('warns and yields null when the response carries no token', async () => {
    const onWarn = vi.fn()
    const manager = managerWith(vi.fn().mockResolvedValue({ data: {} }), { onWarn })

    await expect(manager.getToken()).resolves.toBeNull()
    expect(onWarn).toHaveBeenCalledWith('No access token in the /auth/token/ response')
  })

  it('warns and yields null when the request fails', async () => {
    const onWarn = vi.fn()
    const failure = new Error('offline')
    const manager = managerWith(vi.fn().mockRejectedValue(failure), { onWarn })

    await expect(manager.getToken()).resolves.toBeNull()
    expect(onWarn).toHaveBeenCalledWith('Failed to obtain a dev token', failure)
  })

  it('survives a missing onWarn sink', async () => {
    const manager = managerWith(vi.fn().mockResolvedValue({}))

    await expect(manager.getToken()).resolves.toBeNull()
  })

  it('builds its own axios client when none is injected', async () => {
    const post = vi.fn().mockResolvedValue({ data: { access: 'tok' } })
    const create = vi.spyOn(Axios, 'create').mockReturnValue({ post } as never)
    const manager = createDevTokenManager(enabled)

    await expect(manager.getToken()).resolves.toBe('tok')
    expect(create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8001/',
      headers: { 'Content-Type': 'application/json' },
    })
  })
})

describe('reset', () => {
  it('clears the cache so the next call re-authenticates', async () => {
    const post = vi.fn().mockResolvedValue({ data: { access: 'tok' } })
    const manager = managerWith(post)

    await manager.getToken()
    manager.reset()
    expect(manager.getCachedToken()).toBeNull()
    await manager.getToken()

    expect(post).toHaveBeenCalledTimes(2)
  })
})
