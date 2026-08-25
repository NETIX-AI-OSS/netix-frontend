import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// @ts-expect-error the generator is plain untyped ESM, imported here only to test it
import * as gen from '../../scripts/gen-tokens.mjs'

const {
  buildAll,
  buildPresetCjs,
  buildTokensCss,
  buildTokensTs,
  buildVarsCss,
  check,
  flatten,
  loadTokens,
  main,
  resolve,
  ROOT,
  write,
} = gen

const src = loadTokens()

/** A throwaway repo carrying only the generator's inputs. */
const makeRoot = () => {
  const root = mkdtempSync(join(tmpdir(), 'netix-tokens-'))
  cpSync(join(ROOT, 'tokens'), join(root, 'tokens'), { recursive: true })
  mkdirSync(join(root, 'src/tokens'), { recursive: true })
  cpSync(join(ROOT, 'src/tokens/theme-init.js'), join(root, 'src/tokens/theme-init.js'))
  return root
}

describe('flatten', () => {
  it('picks the requested mode and appends the radius scale', () => {
    const light = Object.fromEntries(flatten(src, 'light'))
    const dark = Object.fromEntries(flatten(src, 'dark'))
    expect(light['brand-600']).toBe('#196796')
    expect(dark['brand-600']).toBe('#4ba3d8')
    expect(light['cat-1']).toBe(dark['cat-1'])
    expect(light['radius-lg']).toBe('10px')
  })
})

describe('resolve', () => {
  it('follows var() chains and leaves unknown references alone', () => {
    expect(
      resolve([
        ['a', 'var(--b)'],
        ['b', 'var(--c)'],
        ['c', '#fff'],
        ['d', '700 14px var(--missing)'],
      ]),
    ).toEqual({ a: '#fff', b: '#fff', c: '#fff', d: '700 14px var(--missing)' })
  })

  it('does not hang on a cycle', () => {
    expect(
      resolve([
        ['a', 'var(--b)'],
        ['b', 'var(--a)'],
      ]),
    ).toEqual({ a: 'var(--b)', b: 'var(--b)' })
  })
})

describe('tokens.css', () => {
  const css = buildTokensCss(src)

  it('declares the dark variant, the fonts and both theme blocks', () => {
    expect(css).toContain('@custom-variant dark (&:is(.dark *));')
    expect(css).toContain("src: url('../fonts/archivo-700.woff2') format('woff2');")
    expect(css).toMatch(/:root \{[\s\S]*--brand-600: #196796;/)
    expect(css).toMatch(/\.dark \{[\s\S]*--brand-600: #4ba3d8;/)
  })

  it('keeps mode-invariant tokens out of the dark block', () => {
    const dark = css.slice(css.indexOf('.dark {'), css.indexOf('[data-density'))
    expect(dark).not.toContain('--cat-1:')
    expect(dark).not.toContain('--space-4:')
  })

  it('maps every Tailwind colour and the radius scale', () => {
    expect(css).toContain('--color-primary: var(--primary);')
    expect(css).toContain('--color-notice-advisory-surface: var(--notice-advisory-surface);')
    expect(css).toMatch(/@theme \{\n {2}--radius-sm: 6px;/)
    expect(css).toContain(
      '--animate-shimmer: shimmer var(--shimmer-duration, 1.5s) linear infinite;',
    )
  })

  it('ships the density switch and the reduced-motion guard', () => {
    expect(css).toContain("[data-density='compact'] {")
    expect(css).toContain('@media (prefers-reduced-motion: reduce) {')
  })
})

describe('vars.css', () => {
  const css = buildVarsCss(src)

  it('covers the OS preference and both [data-theme] overrides', () => {
    expect(css).toContain(":root,\n[data-theme='light'] {")
    expect(css).toContain(":root:not([data-theme='light']):not(.light) {")
    expect(css).toContain(".dark,\n[data-theme='dark'] {")
    expect(css).toContain('color-scheme: dark;')
  })

  it('stays free of Tailwind syntax', () => {
    expect(css).not.toContain('@theme')
    expect(css).not.toContain('@apply')
    expect(css).not.toContain('@custom-variant')
  })
})

describe('preset.cjs', () => {
  const preset = () => {
    const module = { exports: {} }
    new Function('module', 'exports', buildPresetCjs(src))(module, module.exports)
    return module.exports as {
      darkMode: string[]
      theme: { extend: { colors: Record<string, string>; [key: string]: unknown } }
    }
  }

  it('wraps every colour so v3 opacity modifiers keep working', () => {
    const { colors } = preset().theme.extend
    expect(colors.primary).toBe(
      'color-mix(in srgb, var(--primary) calc(<alpha-value> * 100%), transparent)',
    )
    expect(Object.keys(colors)).toHaveLength(Object.keys(src.tailwind.colors).length)
  })

  it('carries the scales v3 apps cannot read from @theme', () => {
    const { darkMode, theme } = preset()
    expect(darkMode).toEqual(['class'])
    expect(theme.extend.borderRadius).toMatchObject({ lg: 'var(--radius-lg)' })
    expect(theme.extend.borderWidth).toMatchObject({ 'form-input': 'var(--border-form-input)' })
    expect(theme.extend.boxShadow).toMatchObject({ focus: 'var(--focus-ring)' })
    expect(theme.extend.fontFamily).toMatchObject({ archivo: 'var(--font-family)' })
    expect(theme.extend.animation).toMatchObject({ 'accordion-up': 'accordion-up 0.2s ease-out' })
    expect(theme.extend.keyframes).toMatchObject({
      shimmer: { '100%': { 'background-position': '-200% 0' } },
    })
  })
})

describe('tokens.ts', () => {
  const ts = buildTokensTs(src)

  it('emits resolved literals under both modes', () => {
    expect(ts).toContain('export const tokens = {')
    expect(ts).toContain("    primary: '#196796',")
    expect(ts).toContain("    primary: '#4ba3d8',")
    expect(ts).toContain('} as const')
  })

  it('matches prettier: dashed keys quoted, apostrophes double-quoted, wide values wrapped', () => {
    expect(ts).toContain("    'brand-600': '#196796',")
    expect(ts).toContain("    'font-mono':\n      \"'JetBrains Mono'")
    const lines: string[] = ts.split('\n')
    expect(lines.every((line) => line.length <= 100 || !line.includes(': '))).toBe(true)
  })
})

describe('write and check', () => {
  let root: string

  beforeEach(() => {
    root = makeRoot()
  })

  afterEach(() => rmSync(root, { recursive: true, force: true }))

  it('reports drift before the first generation', () => {
    const fonts = src.font.faces.map((face: { file: string }) => `dist/fonts/${face.file}`)
    expect(check(root, src)).toEqual([
      ...Object.keys(buildAll(src, root)),
      ...fonts,
      'dist/fonts/OFL.txt',
    ])
  })

  it('writes every artifact and the fonts, then reports no drift', () => {
    write(root, src)
    expect(check(root, src)).toEqual([])
    expect(readFileSync(join(root, 'dist/tokens/theme-init.js'), 'utf8')).toContain('netix-theme')
    expect(readFileSync(join(root, 'dist/fonts/archivo-400.woff2')).byteLength).toBeGreaterThan(0)
  })

  it('detects an edited artifact', () => {
    write(root, src)
    writeFileSync(join(root, 'dist/tokens/vars.css'), '/* hand-edited */')
    expect(check(root, src)).toEqual(['dist/tokens/vars.css'])
  })

  it('detects a stale font copy', () => {
    write(root, src)
    writeFileSync(join(root, 'dist/fonts/archivo-500.woff2'), 'not a font')
    expect(check(root, src)).toEqual(['dist/fonts/archivo-500.woff2'])
  })
})

describe('main', () => {
  let root: string
  const log = vi.fn()

  beforeEach(() => {
    root = makeRoot()
    log.mockClear()
  })

  afterEach(() => rmSync(root, { recursive: true, force: true }))

  it('generates and then passes --check', () => {
    expect(main([], root, log)).toBe(0)
    expect(log).toHaveBeenCalledWith('tokens: generated')
    expect(main(['--check'], root, log)).toBe(0)
    expect(log).toHaveBeenCalledWith('tokens: up to date')
  })

  it('exits non-zero and names the drifted file', () => {
    main([], root, log)
    writeFileSync(join(root, 'src/tokens/tokens.ts'), 'export const tokens = {}')
    expect(main(['--check'], root, log)).toBe(1)
    expect(log).toHaveBeenLastCalledWith(expect.stringContaining('src/tokens/tokens.ts'))
  })
})

it('keeps the committed artifacts in sync with the source', () => {
  expect(check(ROOT, src)).toEqual([])
})
