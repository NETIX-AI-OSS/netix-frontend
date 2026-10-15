import {
  chartPalette,
  cssVar,
  NOTICE_SEVERITIES,
  noticeColor,
  STATUS_NAMES,
  statusColor,
  type StatusName,
  STYLE_NAMES,
  token,
  type TokenName,
  tokens,
} from './index'

const MODES = ['light', 'dark'] as const

// WCAG 2 relative luminance of a resolved hex or oklch() literal, clipped to sRGB
const luminance = (color: string) => {
  const lch = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(color)
  let rgb: number[]
  if (/^#[\da-f]{6}$/i.test(color)) {
    rgb = [0, 2, 4]
      .map((i) => parseInt(color.slice(i + 1, i + 3), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  } else if (lch) {
    const [L = 0, C = 0, H = 0] = lch.slice(1).map(Number)
    const a = C * Math.cos((H * Math.PI) / 180)
    const b = C * Math.sin((H * Math.PI) / 180)
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ]
  } else throw new Error(`unsupported colour ${color}`)
  const [r = 0, g = 0, b = 0] = rgb.map((c) => Math.min(1, Math.max(0, c)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

// The ink an app sets on a solid status fill
const ON_SOLID: Record<StatusName, TokenName> = {
  success: 'success-foreground',
  warning: 'warning-foreground',
  danger: 'destructive-foreground',
  info: 'info-foreground',
  neutral: 'text-inverse',
}

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
  expect(statusColor('success', 'dark', 'foreground')).toBe('oklch(0.76 0.14 153)')
  expect(statusColor('danger', 'light', 'surface')).toBe('oklch(0.95 0.035 27)')
  expect(statusColor('warning', 'dark', 'surface')).toBe('oklch(0.28 0.045 85)')
  expect(statusColor('neutral', 'light', 'border')).toBe(tokens.light.border)
  expect(statusColor('neutral', 'dark', 'surface')).toBe(tokens.dark.muted)
  for (const name of STATUS_NAMES) expect(statusColor(name)).toMatch(/^(#|oklch\()/)
})

describe.each(MODES)('contrast in %s', (mode) => {
  const t = tokens[mode]

  it('keeps every status foreground at AA text contrast on each surface it sits on', () => {
    for (const name of STATUS_NAMES) {
      const ink = statusColor(name, mode, 'foreground')
      for (const ground of [t.card, t.muted, t.background, statusColor(name, mode, 'surface')])
        expect(contrast(ink, ground), `${name} on ${ground}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps every status fill at 3:1 against the card and muted, and its on-solid ink at AA', () => {
    for (const name of STATUS_NAMES) {
      const fill = statusColor(name, mode)
      expect(contrast(fill, t.card), `${name} on card`).toBeGreaterThanOrEqual(3)
      expect(contrast(fill, t.muted), `${name} on muted`).toBeGreaterThanOrEqual(3)
      expect(contrast(t[ON_SOLID[name]], fill), `ink on ${name}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps every status border a hairline that never outshines its ink', () => {
    for (const name of STATUS_NAMES) {
      const border = contrast(statusColor(name, mode, 'border'), t.card)
      expect(border, name).toBeLessThan(3)
      expect(border, name).toBeLessThan(contrast(statusColor(name, mode, 'foreground'), t.card))
    }
  })

  it('ramps the sequential scale from faint to strongest on the card and on muted', () => {
    for (const ground of [t.card, t.muted]) {
      const steps = [1, 2, 3, 4, 5].map((step) =>
        contrast(token(`chart-sequential-${step}` as TokenName, mode), ground),
      )
      expect(steps[0]).toBeLessThan(1.5)
      expect(steps[4]).toBeGreaterThanOrEqual(3)
      expect(steps).toEqual([...steps].sort((x, y) => x - y))
      expect(new Set(steps).size).toBe(steps.length)
    }
  })
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
