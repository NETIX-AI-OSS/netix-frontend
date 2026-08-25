import {
  chartPalette,
  cssVar,
  NOTICE_SEVERITIES,
  noticeColor,
  STATUS_NAMES,
  statusColor,
  token,
  tokens,
} from './index'

it('exposes both themes with the brand mark as primary', () => {
  expect(tokens.light.primary).toBe('#196796')
  expect(tokens.dark.primary).toBe('#4ba3d8')
})

it('resolves aliases down to literal colours', () => {
  expect(tokens.light.background).toBe(tokens.light['surface-app'])
  expect(tokens.light.destructive).toBe(tokens.light['status-critical'])
  expect(tokens.light['chart-1']).toBe(tokens.light['cat-1'])
})

it('carries every non-colour scale', () => {
  expect(tokens.light.radius).toBe('0.625rem')
  expect(tokens.light['radius-lg']).toBe('10px')
  expect(tokens.light['space-4']).toBe('16px')
  expect(tokens.light['motion-fast']).toBe('120ms ease-out')
  expect(tokens.light['type-body']).toContain("400 14px/20px 'Archivo'")
})

it('defaults to light and reads dark on request', () => {
  expect(token('foreground')).toBe(tokens.light.foreground)
  expect(token('foreground', 'dark')).toBe(tokens.dark.foreground)
})

it('names the custom property', () => {
  expect(cssVar('primary')).toBe('var(--primary)')
})

it('reads the status ladder by slot', () => {
  expect(statusColor('ok')).toBe('#16a34a')
  expect(statusColor('ok', 'dark')).toBe('#22c55e')
  expect(statusColor('critical', 'light', 'tint')).toBe('#fce9e9')
  expect(statusColor('nodata', 'light', 'on-tint')).toBe('#475569')
  for (const name of STATUS_NAMES) expect(statusColor(name)).toMatch(/^#/)
})

it('reads the notice ladder by slot', () => {
  expect(noticeColor('advisory')).toBe('#235f9e')
  expect(noticeColor('advisory', 'light', 'surface')).toBe('#eaf2fb')
  expect(noticeColor('critical', 'dark', 'border')).toBe('#4a2523')
  for (const severity of NOTICE_SEVERITIES) expect(noticeColor(severity, 'dark')).toMatch(/^#/)
})

it('returns the Okabe–Ito ramp in order and identical across themes', () => {
  expect(chartPalette()).toHaveLength(10)
  expect(chartPalette()[0]).toBe('#0072b2')
  expect(chartPalette('dark')).toEqual(chartPalette())
})
