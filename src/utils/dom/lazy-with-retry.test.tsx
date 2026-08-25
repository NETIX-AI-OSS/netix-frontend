import { render, screen } from '@testing-library/react'
import { Component, type ReactNode, Suspense } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  BUILD_OUTPUT_PREFIX,
  canReloadForChunkError,
  installChunkErrorReloadHandler,
  isChunkLoadError,
  isChunkLoadErrorEvent,
  isChunkLoadMessage,
  lazyWithRetry,
  MAX_CHUNK_RELOADS,
  recordChunkReload,
  SESSION_STORAGE_KEY,
} from './lazy-with-retry'

class Boundary extends Component<{ children: ReactNode }, { message?: string }> {
  state: { message?: string } = {}
  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }
  render() {
    return this.state.message ? <p>caught {this.state.message}</p> : this.props.children
  }
}

const reload = vi.fn()

beforeEach(() => {
  sessionStorage.clear()
  vi.stubGlobal('location', { reload })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  reload.mockReset()
})

describe('chunk error detection', () => {
  it('matches bundler and browser wordings', () => {
    expect(isChunkLoadMessage()).toBe(false)
    expect(isChunkLoadMessage('Loading chunk 42 failed')).toBe(true)
    expect(isChunkLoadMessage("Unexpected token '<'")).toBe(true)
    expect(isChunkLoadMessage("Unexpected token '<' is not valid JSON")).toBe(false)
    expect(isChunkLoadMessage('boom')).toBe(false)
  })

  it('recognises errors by name or message', () => {
    expect(isChunkLoadError('Loading chunk')).toBe(false)
    expect(isChunkLoadError(Object.assign(new Error('x'), { name: 'ChunkLoadError' }))).toBe(true)
    expect(isChunkLoadError(new Error('Failed to load module script'))).toBe(true)
    expect(isChunkLoadError(new Error('x'))).toBe(false)
  })

  it('only trusts window events pointing at build output', () => {
    expect(isChunkLoadErrorEvent({ message: 'boom', filename: '' })).toBe(false)
    expect(isChunkLoadErrorEvent({ message: 'Loading chunk', filename: '' })).toBe(true)
    expect(
      isChunkLoadErrorEvent({ message: 'Loading chunk', filename: `${BUILD_OUTPUT_PREFIX}a.js` }),
    ).toBe(true)
    expect(isChunkLoadErrorEvent({ message: 'Loading chunk', filename: '/vendor/a.js' })).toBe(
      false,
    )
  })
})

describe('reload guard', () => {
  it('allows reloads until the cap and again once the window lapses', () => {
    expect(canReloadForChunkError()).toBe(true)
    recordChunkReload(1000)
    recordChunkReload(2000)
    expect(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) as string)).toEqual({
      count: MAX_CHUNK_RELOADS,
      at: 2000,
    })
    expect(canReloadForChunkError(3000)).toBe(false)
    expect(canReloadForChunkError(200_000)).toBe(true)
    recordChunkReload(200_000)
    expect(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) as string).count).toBe(1)
  })

  it('ignores unreadable or malformed guards', () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'not json')
    expect(canReloadForChunkError()).toBe(true)
    sessionStorage.setItem(SESSION_STORAGE_KEY, '{"count":"2"}')
    expect(canReloadForChunkError()).toBe(true)
  })

  it('survives a storage write that throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() => recordChunkReload()).not.toThrow()
  })
})

describe('installChunkErrorReloadHandler', () => {
  it('reloads once for a stale build asset', () => {
    const listeners: ((event: ErrorEvent) => void)[] = []
    const target = {
      addEventListener: (_: string, fn: (event: ErrorEvent) => void) => listeners.push(fn),
      location: { reload },
    } as unknown as Window

    installChunkErrorReloadHandler(target)
    const fire = (message: string) =>
      listeners.forEach((fn) => fn({ message, filename: '' } as ErrorEvent))

    fire('boom')
    expect(reload).not.toHaveBeenCalled()

    fire('Loading chunk 1 failed')
    expect(reload).toHaveBeenCalledTimes(1)

    fire('Loading chunk 1 failed')
    fire('Loading chunk 1 failed')
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it('defaults to the current window', () => {
    installChunkErrorReloadHandler()
    window.dispatchEvent(new ErrorEvent('error', { message: 'Loading chunk 1 failed' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})

describe('lazyWithRetry', () => {
  it('renders the imported component', async () => {
    const Lazy = lazyWithRetry(async () => ({ default: () => <p>loaded</p> }))
    render(
      <Suspense fallback={<p>loading</p>}>
        <Lazy />
      </Suspense>,
    )
    expect(await screen.findByText('loaded')).toBeInTheDocument()
  })

  it('reloads the page on a stale chunk and never resolves', async () => {
    const Lazy = lazyWithRetry(() => Promise.reject(new Error('Loading chunk 3 failed')))
    render(
      <Suspense fallback={<p>loading</p>}>
        <Lazy />
      </Suspense>,
    )
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1))
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('rethrows anything that is not a chunk failure', async () => {
    const Lazy = lazyWithRetry(() => Promise.reject(new Error('boom')))
    render(
      <Boundary>
        <Suspense fallback={<p>loading</p>}>
          <Lazy />
        </Suspense>
      </Boundary>,
    )
    expect(await screen.findByText('caught boom')).toBeInTheDocument()
    expect(reload).not.toHaveBeenCalled()
  })
})
