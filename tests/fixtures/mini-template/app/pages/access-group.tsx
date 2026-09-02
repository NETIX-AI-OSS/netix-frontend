import { KeyRound, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { PageBreadcrumbs } from '@/components/application/breadcrumbs'
import { FeedbackState } from '@/components/application/feedback-state'
import { PageLayout } from '@/components/application/layout'
import { OverviewBanner, StatTile } from '@/components/application/overview-banner'
import { SettingsPanel } from '@/components/application/settings-panel'
import { SignedOutState } from '@/components/application/signed-out-state'
import { WorkspaceSidebar } from '@/components/application/sidebar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from 'netix-frontend/hooks'
import { formatLabel } from '@/lib/utils'

export default function AccessGroupPage() {
  const { t } = useTranslation()
  const { group: rawGroup } = useParams()
  const { user, isLoading } = useCurrentUser()

  const groupName = rawGroup ? decodeURIComponent(rawGroup) : ''
  const group = user?.groups.find((entry) => entry.name === groupName)

  return (
    <PageLayout sidebar={<WorkspaceSidebar />} breadcrumbs={<PageBreadcrumbs leaf={groupName} />}>
      {isLoading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      ) : !user ? (
        <SignedOutState />
      ) : !group ? (
        <FeedbackState
          title={t('groupNotFoundTitle')}
          description={t('groupNotFoundDescription')}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <OverviewBanner
            icon={ShieldCheck}
            title={groupName}
            badge={<Badge variant="secondary">{t('access')}</Badge>}
            description={t('groupDescription')}
          >
            <StatTile
              label={t('permissions')}
              value={String(group.permissions.length)}
              detail={t('permissionsDetail')}
              icon={KeyRound}
            />
          </OverviewBanner>

          <SettingsPanel title={t('permissions')} description={t('groupDescription')}>
            {group.permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noGroupPermissionsTitle')}</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {[...group.permissions].sort().map((permission) => (
                  <label
                    key={permission}
                    className="flex items-start gap-3 rounded-xl bg-muted/50 p-3"
                  >
                    <Checkbox checked disabled className="mt-0.5" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{formatLabel(permission)}</span>
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {permission}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </SettingsPanel>
        </div>
      )}
    </PageLayout>
  )
}
