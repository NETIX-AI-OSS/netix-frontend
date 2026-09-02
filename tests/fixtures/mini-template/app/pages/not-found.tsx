import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { FeedbackState } from '@/components/application/feedback-state'
import { PageLayout } from '@/components/application/layout'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <PageLayout title={t('notFoundTitle')}>
      <div className="flex flex-col items-center gap-4 py-10">
        <FeedbackState title={t('notFoundTitle')} description={t('notFoundDescription')} />
        <Button render={<Link to="/" />}>{t('backHome')}</Button>
      </div>
    </PageLayout>
  )
}
