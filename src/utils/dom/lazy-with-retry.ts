import { type ComponentType, lazy } from 'react'

// React.lazy's own constraint is ComponentType<any>; anything narrower is rejected.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>

type ComponentImport<T extends AnyComponent> = () => Promise<{ default: T }>

export const SESSION_STORAGE_KEY = 'chunk_failed_refresh'

/** Vite build.assetsDir — only files under this prefix can go stale after a deploy. */
export const BUILD_OUTPUT_PREFIX = '/static/'

/** Reloads allowed inside CHUNK_RELOAD_WINDOW_MS before the app gives up and surfaces the error. */
export const MAX_CHUNK_RELOADS = 2

export const CHUNK_RELOAD_WINDOW_MS = 60_000

/** Browser and bundler wordings for a chunk that could not be fetched or executed. */
const CHUNK_ERROR_PATTERNS = [
  'ChunkLoadError',
  'Loading chunk',
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Failed to load module script',
  'MIME type',
  'is not executable',
]

/** A missing hashed chunk is answered with index.html, so the parser trips on the HTML. */
const HTML_PARSED_AS_SCRIPT = "Unexpected token '<'"

/** Same wording comes out of JSON.parse on an HTML body, which is not a chunk failure. */
const JSON_PARSE_MARKER = 'is not valid JSON'

type ReloadGuard = { count: number; at: number }

const EMPTY_GUARD: ReloadGuard = { count: 0, at: 0 }

const readGuard = (): ReloadGuard => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return EMPTY_GUARD
    const parsed = JSON.parse(raw) as Partial<ReloadGuard> | null
    if (typeof parsed?.count !== 'number' || typeof parsed?.at !== 'number') return EMPTY_GUARD
    return { count: parsed.count, at: parsed.at }
  } catch {
    return EMPTY_GUARD
  }
}

/** True when `message` describes a chunk fetch/parse failure rather than ordinary app breakage. */
export const isChunkLoadMessage = (message?: string | null): boolean => {
  if (!message) return false
  if (CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern))) return true
  return message.includes(HTML_PARSED_AS_SCRIPT) && !message.includes(JSON_PARSE_MARKER)
}

export const isChunkLoadError = (error: unknown): boolean =>
  error instanceof Error && (error.name === 'ChunkLoadError' || isChunkLoadMessage(error.message))

/** Window `error` events only count when the failing file is part of the build output. */
export const isChunkLoadErrorEvent = (event: Pick<ErrorEvent, 'message' | 'filename'>): boolean => {
  if (!isChunkLoadMessage(event.message)) return false
  return !event.filename || event.filename.includes(BUILD_OUTPUT_PREFIX)
}

/** Guard survives boot on purpose: clearing it there is what let reloads run forever. */
export const canReloadForChunkError = (now = Date.now()): boolean => {
  const { count, at } = readGuard()
  return count < MAX_CHUNK_RELOADS || now - at > CHUNK_RELOAD_WINDOW_MS
}

export const recordChunkReload = (now = Date.now()): void => {
  const { count, at } = readGuard()
  const expired = now - at > CHUNK_RELOAD_WINDOW_MS
  try {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ count: expired ? 1 : count + 1, at: now }),
    )
  } catch {
    // sessionStorage can be unavailable (private mode); losing the guard beats crashing boot.
  }
}

/** Reloads once onto fresh HTML when a script tag fails for a stale build-output file. */
export const installChunkErrorReloadHandler = (target: Window = window): void => {
  target.addEventListener('error', (event: ErrorEvent) => {
    if (!isChunkLoadErrorEvent(event)) return
    if (!canReloadForChunkError()) return
    recordChunkReload()
    target.location.reload()
  })
}

/** Wraps React.lazy so a chunk that went stale across a deploy reloads instead of white-screening. */
export function lazyWithRetry<T extends AnyComponent>(importFn: ComponentImport<T>) {
  return lazy(async () => {
    try {
      return await importFn()
    } catch (error) {
      if (isChunkLoadError(error) && canReloadForChunkError()) {
        recordChunkReload()
        window.location.reload()
        // Never resolves; the reload replaces this document.
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    }
  })
}
