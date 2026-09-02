import {
  chartPalette,
  cssVar,
  NOTICE_SEVERITIES,
  noticeColor,
  STATUS_NAMES,
  statusColor,
  STYLE_NAMES,
  token,
  tokens,
} from './index'

it('exposes both themes with the brand mark as primary', () => {
  expect(tokens.light.primary).toBe('#196796')
  expect(tokens.dark.primary).toBe('#196796')
  expect(tokens.light.background).not.toBe(tokens.dark.background)
})

it('resolves aliases down to literal colours', () => {
  expect(tokens.light['surface-app']).toBe(tokens.light.background)
  expect(tokens.light['status-danger']).toBe(tokens.light.destructive)
  expect(tokens.light['chart-1']).toBe(tokens.light.primary)
  expect(tokens.light['chart-categorical-5']).toBe(tokens.light['chart-5'])
  expect(tokens.light['chart-diverging-positive']).toBe(tokens.light['status-success'])
})

it('carries every non-colour scale', () => {
  expect(tokens.light.radius).toBe('0.625rem')
  expect(tokens.light['radius-lg']).toBe('0.625rem')
  expect(tokens.light['space-4']).toBe('1rem')
  expect(tokens.light['duration-fast']).toBe('120ms')
  expect(tokens.light['type-display-size']).toBe('2.25rem')
  expect(tokens.light['typeface-body']).toContain("'Archivo'")
})

it('defaults to light and reads dark on request', () => {
  expect(token('foreground')).toBe(tokens.light.foreground)
  expect(token('foreground', 'dark')).toBe(tokens.dark.foreground)
})

it('lists the design styles the token layer ships, default first', () => {
  expect(STYLE_NAMES[0]).toBe('nova')
  expect(STYLE_NAMES).toContain('rhea')
})

it('names the custom property', () => {
  expect(cssVar('primary')).toBe('var(--primary)')
})

it('reads the status ladder by slot', () => {
  expect(statusColor('success')).toBe('oklch(0.51 0.15 153)')
  expect(statusColor('success', 'light', 'foreground')).toBe(statusColor('success'))
  expect(statusColor('danger', 'light', 'surface')).toBe('oklch(0.95 0.035 27)')
  expect(statusColor('warning', 'dark', 'surface')).toBe('oklch(0.28 0.045 85)')
  expect(statusColor('neutral', 'light', 'border')).toBe(tokens.light.border)
  for (const name of STATUS_NAMES) expect(statusColor(name)).toMatch(/^(#|oklch\()/)
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
