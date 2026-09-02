import { ChevronRight, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PageBreadcrumbs } from '@/components/application/breadcrumbs'
import { FeedbackState } from '@/components/application/feedback-state'
import { PageLayout } from '@/components/application/layout'
import { SettingsPanel } from '@/components/application/settings-panel'
import { SignedOutState } from '@/components/application/signed-out-state'
import { WorkspaceSidebar } from '@/components/application/sidebar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from 'netix-frontend/hooks'
import { accessGroupPath } from '@/lib/navigation'

export default function AccessPage() {
  const { t } = useTranslation()
  const { user, isLoading } = useCurrentUser()
  const [query, setQuery] = useState('')

  const groups = user?.groups ?? []
  const visible = useMemo(
    () => groups.filter((group) => group.name.toLowerCase().includes(query.trim().toLowerCase())),
    [groups, query],
  )

  return (
    <PageLayout
      sidebar={<WorkspaceSidebar />}
      breadcrumbs={<PageBreadcrumbs />}
      title={t('access')}
      description={t('accessDescription')}
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : !user ? (
        <SignedOutState />
      ) : groups.length === 0 ? (
        <FeedbackState title={t('noGroupsTitle')} description={t('noGroupsDescription')} />
      ) : (
        <SettingsPanel title={t('accessGroups')} description={t('groupsDetail')}>
          <div className="flex flex-col gap-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('filterGroups')}
              aria-label={t('filterGroups')}
              className="max-w-xs"
            />

            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noMatches')}</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {visible.map((group) => (
                  <Link
                    key={group.name}
                    to={accessGroupPath(group.name)}
                    className="group flex items-center gap-3 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary">
                      <ShieldCheck className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{group.name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {group.permissions.length} {t('permissions').toLowerCase()}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </SettingsPanel>
      )}
    </PageLayout>
  )
}
