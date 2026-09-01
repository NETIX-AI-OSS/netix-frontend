import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// @ts-expect-error the generator is plain untyped ESM, imported here only to test it
import * as gen from '../../scripts/gen-tokens.mjs'

const {
  buildAll,
  buildPresetCjs,
  buildStylesCss,
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
  mkdirSync(join(root, 'node_modules/shadcn/dist'), { recursive: true })
  cpSync(
    join(ROOT, 'node_modules/shadcn/dist/tailwind.css'),
    join(root, 'node_modules/shadcn/dist/tailwind.css'),
  )
  return root
}

describe('flatten', () => {
  it('picks the requested mode and appends the radius scale', () => {
    const light = Object.fromEntries(flatten(src, 'light'))
    const dark = Object.fromEntries(flatten(src, 'dark'))
    expect(light['primary']).toBe('#196796')
    expect(dark['primary']).toBe('#196796')
    expect(light['background']).not.toBe(dark['background'])
    expect(light['cat-1']).toBe(dark['cat-1'])
    expect(light['radius-lg']).toBe('0.625rem')
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
    expect(css).toMatch(/:root \{[\s\S]*--primary: #196796;/)
    expect(css).toMatch(/\.dark \{[\s\S]*--background: oklch\(0\.17 0 0\);/)
  })

  it('satisfies the Nova contract markers and bans the legacy ones', () => {
    for (const marker of [
      '--primary: #196796',
      '--tint:',
      '--accent: oklch(0.18 0 0)',
      '--status-success-foreground',
      '--type-display-size',
      "--typeface-body: 'Archivo'",
      '--space-12',
      '--chart-categorical-5',
      '--chart-diverging-positive',
    ])
      expect(css).toContain(marker)
    expect(css).not.toContain('--brand')
    expect(css).not.toContain('Inter')
  })

  it('keeps mode-invariant tokens out of the dark block', () => {
    const dark = css.slice(css.indexOf('.dark {'), css.indexOf('@theme inline'))
    expect(dark).not.toContain('--cat-1:')
    expect(dark).not.toContain('--space-4:')
    expect(dark).not.toContain('--primary:')
  })

  it('maps every Tailwind colour, the fonts and the radius scale', () => {
    expect(css).toContain('--color-primary: var(--primary);')
    expect(css).toContain('--color-notice-advisory-surface: var(--notice-advisory-surface);')
    expect(css).toContain('--font-sans: var(--typeface-body);')
    expect(css).toContain('--font-heading: var(--typeface-display);')
    expect(css).toMatch(/@theme \{\n {2}--radius: 0\.625rem;/)
    expect(css).toContain('--radius-2xl: calc(var(--radius) * 1.8);')
    expect(css).toContain(
      '--animate-shimmer: shimmer var(--shimmer-duration, 1.5s) linear infinite;',
    )
  })

  it('ships the focus ring, the reduced-motion guard and no density blocks', () => {
    expect(css).toContain('outline: 2px solid var(--ring);')
    expect(css).toContain('@media (prefers-reduced-motion: reduce) {')
    expect(css).not.toContain('[data-density')
    expect(css).not.toContain('\n\n\n')
  })
})

describe('styles.css', () => {
  const css = buildStylesCss()

  it('imports Tailwind, the token layer and the vendored shadcn sheet in order', () => {
    const tailwind = css.indexOf("@import 'tailwindcss';")
    const tokens = css.indexOf("@import './tokens/tokens.css';")
    const shadcn = css.indexOf("@import './shadcn-tailwind.css';")
    expect(tailwind).toBeGreaterThan(-1)
    expect(tokens).toBeGreaterThan(tailwind)
    expect(shadcn).toBeGreaterThan(tokens)
  })

  it('vendors the enter/exit animation utilities the base-nova components use', () => {
    for (const utility of [
      '@utility animate-in',
      '@utility animate-out',
      '@utility fade-in-0',
      '@utility zoom-out-95',
      '@utility slide-in-from-right-2',
    ])
      expect(css).toContain(utility)
  })

  it('carries the app-shell base layer', () => {
    expect(css).toContain('border-color: var(--border);')
    expect(css).toContain('#root {')
    expect(css).toContain("[data-slot='select-trigger']:focus-visible")
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
    expect(theme.extend.boxShadow).toMatchObject({ popover: 'var(--shadow-popover)' })
    expect(theme.extend.fontFamily).toMatchObject({ sans: 'var(--typeface-body)' })
    expect(theme.extend.animation).toMatchObject({
      shimmer: 'shimmer var(--shimmer-duration, 1.5s) linear infinite',
    })
    expect(theme.extend.keyframes).toMatchObject({
      shimmer: { '100%': { 'background-position': '-200% 0' } },
    })
    expect(theme.extend.borderWidth).toBeUndefined()
  })
})

describe('tokens.ts', () => {
  const ts = buildTokensTs(src)

  it('emits resolved literals under both modes', () => {
    expect(ts).toContain('export const tokens = {')
    expect(ts).toContain("    primary: '#196796',")
    expect(ts).toContain("    background: 'oklch(0.17 0 0)',")
    expect(ts).toContain('} as const')
  })

  it('matches prettier: dashed keys quoted, apostrophes double-quoted, wide values wrapped', () => {
    expect(ts).toContain("    'chart-categorical-5':")
    expect(ts).toContain("    'typeface-body':\n      \"'Archivo'")
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
      'dist/shadcn-tailwind.css',
    ])
  })

  it('writes every artifact and the copies, then reports no drift', () => {
    write(root, src)
    expect(check(root, src)).toEqual([])
    expect(readFileSync(join(root, 'dist/tokens/theme-init.js'), 'utf8')).toContain('netix-theme')
    expect(readFileSync(join(root, 'dist/fonts/archivo-400.woff2')).byteLength).toBeGreaterThan(0)
    expect(readFileSync(join(root, 'dist/shadcn-tailwind.css'), 'utf8')).toContain(
      '@custom-variant data-open',
    )
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
