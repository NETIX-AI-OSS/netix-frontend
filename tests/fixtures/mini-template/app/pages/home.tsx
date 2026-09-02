import { ArrowUpRight, KeyRound, Layers, UserRound, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PageLayout } from '@/components/application/layout'
import { OverviewBanner, StatTile } from '@/components/application/overview-banner'
import { SignedOutState } from '@/components/application/signed-out-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from 'netix-frontend/hooks'
import { getFullUserName } from '@/lib/utils'
import { NAVIGATION, navDescription, navLabel } from '@/lib/navigation'

/** Distinct module prefixes in `module.codename` permission codes. */
const moduleCount = (permissions: string[]) =>
  new Set(permissions.map((code) => code.split('.')[0])).size

export default function HomePage() {
  const { t } = useTranslation()
  const { user, isLoading } = useCurrentUser()

  const workspacePages = NAVIGATION.find((area) => area.path === '/workspace')?.pages ?? []

  return (
    // No PageHeader: the overview banner leads the page, user-profile style.
    <PageLayout>
      {isLoading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-56 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        </div>
      ) : !user ? (
        <SignedOutState />
      ) : (
        <div className="flex flex-col gap-6">
          <OverviewBanner
            icon={UserRound}
            title={t('welcomeBack', { name: user.first_name || user.username })}
            badge={user.isSuperuser ? <Badge variant="secondary">{t('superuser')}</Badge> : null}
            description={
              [user.email, user.designation].filter(Boolean).join(' · ') ||
              getFullUserName(user) ||
              undefined
            }
            aside={
              user.username ? (
                <div className="sm:text-end">
                  <p className="text-xs text-muted-foreground">{t('username')}</p>
                  <p className="font-semibold">{user.username}</p>
                </div>
              ) : null
            }
          >
            <StatTile
              label={t('accessGroups')}
              value={String(user.groups.length)}
              detail={t('groupsDetail')}
              icon={UsersRound}
            />
            <StatTile
              label={t('permissions')}
              value={String(user.permissions.length)}
              detail={t('permissionsDetail')}
              icon={KeyRound}
            />
            <StatTile
              label={t('modules')}
              value={String(moduleCount(user.permissions))}
              detail={t('modulesDetail')}
              icon={Layers}
            />
          </OverviewBanner>

          <div className="grid gap-4 sm:grid-cols-2">
            {workspacePages.map((page) => (
              <Link key={page.path} to={page.path} className="group text-start">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-2xl bg-primary-subtle text-primary">
                        <page.icon className="size-5" />
                      </span>
                      <ArrowUpRight className="size-5 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground rtl:-scale-x-100" />
                    </div>
                    <h3 className="font-semibold">{navLabel(page, t)}</h3>
                    <p className="text-sm text-muted-foreground">{navDescription(page, t)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  )
}
