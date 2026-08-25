import { tokens } from './tokens'

export { tokens }

export type ThemeMode = keyof typeof tokens
export type TokenName = keyof (typeof tokens)['light']

export const STATUS_NAMES = [
  'ok',
  'warning',
  'critical',
  'info',
  'neutral',
  'offline',
  'stale',
  'nodata',
] as const
export type StatusName = (typeof STATUS_NAMES)[number]

/** base = the ink/graph colour, fill = solid backgrounds, tint = subtle surfaces. */
export type StatusSlot = 'base' | 'fill' | 'on' | 'tint' | 'on-tint'

export const NOTICE_SEVERITIES = ['advisory', 'attention', 'critical'] as const
export type NoticeSeverity = (typeof NOTICE_SEVERITIES)[number]

/** Resolved value of one token, e.g. token('primary', 'dark'). */
export const token = (name: TokenName, mode: ThemeMode = 'light'): string => tokens[mode][name]

/** The CSS custom property, for cases that must stay live across theme switches. */
export const cssVar = (name: TokenName) => `var(--${name})`

export const statusColor = (
  status: StatusName,
  mode: ThemeMode = 'light',
  slot: StatusSlot = 'base',
): string =>
  token((slot === 'base' ? `status-${status}` : `status-${status}-${slot}`) as TokenName, mode)

export const noticeColor = (
  severity: NoticeSeverity,
  mode: ThemeMode = 'light',
  slot: 'ink' | 'surface' | 'border' = 'ink',
): string =>
  token((slot === 'ink' ? `notice-${severity}` : `notice-${severity}-${slot}`) as TokenName, mode)

/** Okabe–Ito categorical ramp, in order — never use it to encode status. */
export const chartPalette = (mode: ThemeMode = 'light'): string[] =>
  Array.from({ length: 10 }, (_, index) => token(`cat-${index + 1}` as TokenName, mode))
