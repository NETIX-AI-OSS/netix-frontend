import { type ReactNode, type UIEvent, useRef, useState } from 'react'

import { PageHeader } from '@/components/recipes'
import { AppTopBar } from '@/components/topbar'

const NAVIGATION_TOGGLE_DISTANCE = 12

type PageLayoutProps = {
  /** Optional contextual navigation. It is rendered before the page pane. */
  sidebar?: ReactNode
  /** Content such as a breadcrumb trail, rendered above the page heading. */
  breadcrumbs?: ReactNode
  /** Override the default PageHeader when a page needs a richer heading. */
  header?: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

/**
 * Route-owned layout for contextual navigation and page content.
 *
 * AppLayout owns only the persistent product rail. Keeping this boundary here
 * means the title/utility bar is positioned by flex layout after any number of
 * contextual sidebars, without a width or left-offset prop.
 */
export function PageLayout({
  sidebar,
  breadcrumbs,
  header,
  title,
  description,
  actions,
  children,
}: PageLayoutProps) {
  const contentScrollRef = useRef<HTMLDivElement>(null)
  const previousScrollTop = useRef(0)
  const scrollDirection = useRef<'toward-start' | 'toward-end' | null>(null)
  const scrollDistance = useRef(0)
  const [isTopBarHidden, setIsTopBarHidden] = useState(false)

  const handleContentScroll = (event: UIEvent<HTMLDivElement>) => {
    const nextScrollTop = event.currentTarget.scrollTop
    const delta = nextScrollTop - previousScrollTop.current

    if (nextScrollTop <= 8) {
      setIsTopBarHidden(false)
      scrollDirection.current = null
      scrollDistance.current = 0
    } else if (delta !== 0) {
      const nextDirection = delta < 0 ? 'toward-start' : 'toward-end'

      if (scrollDirection.current !== nextDirection) {
        scrollDirection.current = nextDirection
        scrollDistance.current = 0
      }

      scrollDistance.current += Math.abs(delta)

      if (scrollDistance.current >= NAVIGATION_TOGGLE_DISTANCE) {
        setIsTopBarHidden(nextDirection === 'toward-end')
        scrollDistance.current = 0
      }
    }

    previousScrollTop.current = nextScrollTop
  }

  return (
    <div className="flex h-full min-w-0">
      {sidebar}
      <div className="relative min-w-0 flex-1 bg-background">
        <AppTopBar isHidden={isTopBarHidden} />
        <div
          ref={contentScrollRef}
          onScroll={handleContentScroll}
          className="h-full overflow-y-auto pt-14"
        >
          <div className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {breadcrumbs}
            {header ??
              (title ? (
                <PageHeader title={title} description={description} actions={actions} />
              ) : null)}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
