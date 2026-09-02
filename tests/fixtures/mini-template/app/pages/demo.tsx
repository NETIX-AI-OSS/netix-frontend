import { Boxes, Database, Hash, Rows3 } from 'lucide-react'
import { useState } from 'react'

import { PageBreadcrumbs } from '@/components/application/breadcrumbs'
import { PageLayout } from '@/components/application/layout'
import { OverviewBanner, StatTile } from '@/components/application/overview-banner'
import { WorkspaceSidebar } from '@/components/application/sidebar'
import { DataTable, type DataTableColumn } from '@/components/composites/data-table'
import { Badge } from '@/components/ui/badge'

type DemoRecord = {
  id: string
  name: string
  title: string
  displayName: string
  description: string
}

const DEMO_NAMES = [
  'dokaae-site-abraj-al-bait',
  'dokaae-bldg-twra',
  'dokaae-bldg-twrb',
  'dokaae-bldg-twrc',
  'dokaae-bldg-twrd',
  'dokaae-bldg-twrf',
  'dokaae-bldg-twrk',
  'dokaae-bldg-twrh',
  'dokaae-bldg-pod',
  'dokaae-twra-chwp001',
  'dokaae-twra-chwp002',
  'dokaae-twra-ahup001',
  'dokaae-twra-ahup002',
  'dokaae-twra-lift001',
  'dokaae-twra-lift002',
]

const DEMO_ROWS: DemoRecord[] = Array.from({ length: 48 }, (_, index) => {
  const name = DEMO_NAMES[index] ?? `demo-record-${String(index + 1).padStart(3, '0')}`
  const title =
    index === 0
      ? 'DOKAAE — Abraj Al Bait Clock Tower'
      : index < 8
        ? `Tower ${String.fromCharCode(65 + index - 1)}`
        : `Asset ${String(index + 1).padStart(3, '0')}`

  return {
    id: name,
    name,
    title,
    displayName: title,
    description:
      index === 0
        ? 'Root node for the demo asset hierarchy.'
        : index % 4 === 0
          ? 'Example record for testing table pagination.'
          : '',
  }
})

const COLUMNS: DataTableColumn<DemoRecord>[] = [
  { accessorKey: 'name', header: 'Name', size: 280 },
  { accessorKey: 'title', header: 'Title', size: 300 },
  { accessorKey: 'displayName', header: 'Display name', size: 300 },
  { accessorKey: 'description', header: 'Description', size: 420 },
]

/**
 * Local-only module page for previewing the template's list composition — the same shape
 * `netix init` generates per service, without a backend. Delete this file, its `lazy.ts`
 * export, its route in main.tsx and its NAVIGATION entry when starting a real application.
 */
export default function DemoPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const pageStart = pagination.pageIndex * pagination.pageSize
  const pageRows = Math.min(pagination.pageSize, Math.max(DEMO_ROWS.length - pageStart, 0))

  return (
    <PageLayout sidebar={<WorkspaceSidebar />} breadcrumbs={<PageBreadcrumbs />}>
      <OverviewBanner
        icon={Boxes}
        title="Module demo"
        badge={<Badge variant="secondary">Demo data</Badge>}
        description="A local dataset for previewing the module page layout and pagination."
      >
        <StatTile
          label="Total records"
          value={DEMO_ROWS.length.toLocaleString()}
          detail="Local dataset"
          icon={Database}
        />
        <StatTile
          label="On this page"
          value={pageRows.toLocaleString()}
          detail="Visible rows"
          icon={Rows3}
        />
        <StatTile
          label="Current page"
          value={(pagination.pageIndex + 1).toLocaleString()}
          detail={pagination.pageSize + ' rows per page'}
          icon={Hash}
        />
      </OverviewBanner>
      <DataTable
        data={DEMO_ROWS}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        state={{ pagination, columnPinning: { start: ['name'], end: [] } }}
        onPaginationChange={setPagination}
        heightAuto
        pagination={{ pageSizeOptions: [5, 10, 20] }}
      />
    </PageLayout>
  )
}
