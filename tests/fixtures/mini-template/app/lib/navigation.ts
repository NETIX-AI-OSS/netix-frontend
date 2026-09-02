import { Boxes, Home, LayoutGrid, type LucideIcon, Palette, ShieldCheck } from 'lucide-react'

/**
 * The single source of truth for this app's information architecture. The product rail,
 * the workspace sidebar, the breadcrumb trail and the ⌘K page search all derive from this
 * list — add a page here plus its lazy export in app/pages/lazy.ts and its route in
 * app/main.tsx, and every surface picks it up. Generated service pages are ordinary
 * entries: `netix init` and `netix service add` write them at the anchor below, and
 * removing one means deleting its page file and its three lines.
 */

export type NavPage = {
  /** i18n key, translated at render time so a language switch re-renders it. */
  labelKey?: string
  /** A literal label for pages named after a service — proper nouns are not translated. */
  label?: string
  /** A literal blurb for the home cards; pages with a `labelKey` read theirs from translations. */
  description?: string
  path: string
  icon: LucideIcon
  /** Exact-match highlighting for the rail (only the root needs it). */
  end?: boolean
}

export type NavArea = NavPage & {
  /** Second-menu entries rendered in the workspace sidebar. */
  pages?: NavPage[]
}

export const NAVIGATION: NavArea[] = [
  { labelKey: 'home', path: '/', icon: Home, end: true },
  {
    labelKey: 'workspace',
    path: '/workspace',
    icon: LayoutGrid,
    pages: [
      { labelKey: 'access', path: '/workspace/access', icon: ShieldCheck },
      { labelKey: 'designSystem', path: '/workspace/design-system', icon: Palette },
      // Built-in local demo so the template can preview module pages without a backend.
      {
        label: 'Module demo',
        description: 'A local dataset for previewing the module page layout and pagination.',
        path: '/workspace/demo',
        icon: Boxes,
      },
      // netix-nav:insert
    ],
  },
]

/** A proper-noun `label` wins; otherwise the i18n key, translated at render time. */
export const navLabel = (
  entry: { labelKey?: string; label?: string },
  t: (key: string) => string,
): string => entry.label ?? (entry.labelKey ? t(entry.labelKey) : '')

/** The home card's blurb: a literal `description`, or the page's `<labelKey>QuickDescription`. */
export const navDescription = (page: NavPage, t: (key: string) => string): string =>
  page.description ?? (page.labelKey ? t(`${page.labelKey}QuickDescription`) : '')

/** Detail routes build their paths here so list rows, search and tests agree on the URL. */
export const accessGroupPath = (group: string) => `/workspace/access/${encodeURIComponent(group)}`

const isOnPath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`)

/** Carries whichever of `labelKey`/`label` its page had; resolve it with `navLabel`. */
export type Crumb = { labelKey?: string; label?: string; href: string }

const crumbOf = (page: NavPage): Crumb =>
  page.label ? { label: page.label, href: page.path } : { labelKey: page.labelKey, href: page.path }

/** Manifest crumbs for a location, root-first: /workspace/access/x → workspace, access. */
export function breadcrumbTrail(pathname: string): Crumb[] {
  const trail: Crumb[] = []
  for (const area of NAVIGATION) {
    const matches = area.path === '/' ? pathname === '/' : isOnPath(pathname, area.path)
    if (!matches) continue
    trail.push(crumbOf(area))
    for (const page of area.pages ?? []) {
      if (isOnPath(pathname, page.path)) trail.push(crumbOf(page))
    }
  }
  return trail
}

export type SearchablePage = NavPage & { areaLabelKey?: string }

/** Every navigable page, flattened with its area, for the command palette. */
export function searchablePages(): SearchablePage[] {
  return NAVIGATION.flatMap((area): SearchablePage[] => {
    const { pages, ...areaPage } = area
    return pages ? pages.map((page) => ({ ...page, areaLabelKey: area.labelKey })) : [areaPage]
  })
}

/** The second-menu entries for the area containing `pathname`; empty for areas without one. */
export function areaPages(pathname: string): NavPage[] {
  const area = NAVIGATION.find((entry) => entry.path !== '/' && isOnPath(pathname, entry.path))
  return area?.pages ?? []
}
