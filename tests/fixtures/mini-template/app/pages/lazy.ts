import { lazy } from 'react'

/**
 * One lazy element per page, so main.tsx stays a plain route table and every page is its
 * own chunk. `netix init` and `netix service add` append generated pages at the anchor;
 * a page added by hand goes in exactly the same way — a line here, a <Route> in main.tsx
 * and an entry in app/lib/navigation.ts.
 */

export const HomePage = lazy(() => import('@/pages/home'))
export const AccessPage = lazy(() => import('@/pages/access'))
export const AccessGroupPage = lazy(() => import('@/pages/access-group'))
export const DesignSystemPage = lazy(() => import('@/pages/design-system'))
export const DemoPage = lazy(() => import('@/pages/demo'))
export const NotFoundPage = lazy(() => import('@/pages/not-found'))
// netix-pages:insert
