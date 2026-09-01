import { Outlet } from 'react-router'

import { AppShell } from '@/components/recipes'
import { AppSidebar } from '@/components/sidebar'

export { PageLayout } from './page-layout'

export default function Layout() {
  return (
    <AppShell>
      <div className="flex h-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </AppShell>
  )
}
