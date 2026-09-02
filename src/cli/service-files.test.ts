// @vitest-environment node
import { readFileSync } from 'node:fs'

import {
  buildDevUpstreamEntry,
  buildEnvApiEntry,
  buildLazyPageEntry,
  buildNavEntry,
  buildOrvalBlock,
  buildRouteEntry,
  buildServiceClient,
  buildServiceClientTest,
  buildServicePage,
} from './service-files'
import { loadManifest } from './services'

const manifest = loadManifest()
const cafm = manifest.services.cafm!

it('generates a client wired to the ENV entry, not to import.meta.env', () => {
  const out = buildServiceClient('cafm')
  expect(out).toContain("import { ENV } from '@/config/env'")
  expect(out).toContain('export const CAFM_SERVICE_BASE_URL = ENV.api.cafmService')
  expect(out).toContain("clientName: 'cafm-service'")
  expect(out).toContain('export const httpCafmServiceClient = createMutator(AXIOS_INSTANCE)')
  expect(out).not.toContain('import.meta.env')
  expect(out).not.toContain('localhost')
})

it('generates a client that rides the app auth seam', () => {
  const out = buildServiceClient('cafm')
  expect(out).toContain("import { getAccessToken } from '@/lib/auth'")
  expect(out).toContain('getToken: getAccessToken,')
})

it('generates a client test that targets the same file it generates', () => {
  const out = buildServiceClientTest('cafm')
  expect(out).toContain("from './http-cafm-service-client'")
  expect(out).toContain("context: { client: 'cafm-service' }")
  expect(out).toContain('throws instead of logging out on 403')
  expect(out).toContain('no bearer header without a session')
})

it('generates an orval block pointing at the generated client and schema', () => {
  const out = buildOrvalBlock('cafm')
  expect(out).toContain("client: 'react-query'")
  expect(out).toContain("'cafm-service': {")
  expect(out).toContain("input: './schema/cafm-service.yaml'")
  expect(out).toContain("path: './app/client/http-cafm-service-client.ts'")
  expect(out).toContain("name: 'httpCafmServiceClient'")
})

it('generates the env and upstream entries from the manifest subdomain', () => {
  expect(buildEnvApiEntry('cafm', cafm)).toBe(
    "      cafmService: serviceUrl('cafm.api', '/cafm-api'),\n",
  )
  expect(buildDevUpstreamEntry('cafm', cafm)).toBe(
    "    '/cafm-api': `https://cafm.api.${baseDomain}`,\n",
  )
})

it('generates a self-contained service page with a TanStack Query paginated table', () => {
  const out = buildServicePage('cafm', cafm)
  expect(out).toContain("import { keepPreviousData, useQuery } from '@tanstack/react-query'")
  expect(out).toContain("import { AXIOS_INSTANCE } from '@/client/http-cafm-service-client'")
  expect(out).toContain("import { Boxes, Database, Hash, Rows3 } from 'lucide-react'")
  expect(out).toContain('export default function CafmPage()')
  expect(out).toContain(
    "import { OverviewBanner, StatTile } from '@/components/application/overview-banner'",
  )
  expect(out).toContain('<OverviewBanner')
  expect(out).toContain('<StatTile')
  expect(out).toContain('Browse and manage cafm records.')
  expect(out).not.toContain('Search records')
  expect(out).toContain('const PAGE_SIZE = 10')
  // The table sits directly under the banner: no wrapper card, no spacing or border overrides.
  expect(out).toContain('</OverviewBanner>\n          <DataTable\n            data={rows}')
  expect(out).not.toContain('bg-transparent')
  expect(out).not.toContain('mx-5 mb-5')
  expect(out).toContain('limit: pagination.pageSize')
  expect(out).toContain('offset: pagination.pageIndex * pagination.pageSize')
  expect(out).toContain("queryKey: ['cafm-service', LIST_ENDPOINT, pagination, filters]")
  expect(out).toContain('...(filters ?? {})')
  expect(out).toContain("key: field === 'id' ? 'id__in' : field + '__in'")
  expect(out).toContain('filtering={{')
  expect(out).not.toContain('import.meta.env')
})

it('renders the module table with @netix/data-table, not a bare <table>', () => {
  // The registry component is what carries pinning, filters, sizing and the loading
  // and empty states; the ui/table primitive carries none of them.
  const out = buildServicePage('cafm', cafm)
  expect(out).toContain(
    "import { DataTable, type DataTableColumn } from '@/components/composites/data-table'",
  )
  expect(out).not.toContain('useTable')
  expect(out).not.toContain('dataTableFeatures')
  // The v8 compat adapter is deprecated; generated code must never reach for it.
  expect(out).not.toContain('@tanstack/react-table/legacy')
  expect(out).not.toContain('useLegacyTable')
  expect(out).toContain('<DataTable')
  expect(out).toContain('EmptyComponent={NoRows}')
  expect(out).toContain('pagination={{ pageSizeOptions: [10, 25, 50, 100] }}')
  // heightAuto: without it DataTable fills an absolutely-positioned parent and the
  // page, which just flows, would render a zero-height table.
  expect(out).toContain('heightAuto')
  expect(out).toContain('columnPinning: { start: columns[0]?.id ? [columns[0].id] : [], end: [] }')
  expect(out).not.toContain("from '@/components/ui/table'")
  expect(out).not.toContain('<TableHeader>')
})

it('builds columns from the schema, independent of the rows', () => {
  // The whole point: a collection that comes back empty must still render its header
  // row, its widths and its formatting. Columns that depend on rows[0] cannot.
  const out = buildServicePage('cafm', cafm, [
    { field: 'name', kind: 'text' },
    { field: 'is_active', kind: 'boolean' },
    { field: 'created_on', kind: 'date' },
  ])
  expect(out).toContain("{ field: 'name', kind: 'text' },")
  expect(out).toContain("{ field: 'is_active', kind: 'boolean' },")
  expect(out).toContain("{ field: 'created_on', kind: 'date' },")
  // The memo must not depend on rows, or the columns come back to depending on data.
  expect(out).toContain('COLUMNS.map(({ field, kind }, index) => ({')
  expect(out).toContain('    [t, locale],')
  expect(out).not.toContain('inferColumns')
  // DataTable lays the table out from getTotalSize(), so unsized columns collapse.
  expect(out).toContain('size: index === 0 ? 280 : 170')
  expect(out).toContain('className="block truncate"')
})

it('falls back to inferring columns only when no spec was on disk', () => {
  const out = buildServicePage('cafm', cafm)
  expect(out).toContain('const COLUMNS: TableColumn[] = []')
  expect(out).toContain('COLUMNS.length ? COLUMNS : inferColumns(rows)')
  expect(out).toContain('netix init --no-schemas')
  expect(out).toContain('netix service add cafm')
})

it('formats each cell by its declared type, not by sniffing the value', () => {
  const out = buildServicePage('cafm', cafm, [{ field: 'created_on', kind: 'date' }])
  expect(out).toContain("if (kind === 'boolean') return translate(value ? 'yes' : 'no')")
  expect(out).toContain('parsed.toLocaleDateString(locale)')
  expect(out).toContain("if (value === null || value === undefined || value === '') return '—'")
})

it('opens every generated service page on a real collection, never on the service root', () => {
  // `GET /` is the one route no NETIX backend serves: a page that starts there
  // renders its error state on the first paint of a freshly scaffolded app.
  for (const [key, service] of Object.entries(manifest.services)) {
    const out = buildServicePage(key, service)
    expect(out).toContain(`const LIST_ENDPOINT = '${service.listEndpoint}'`)
    expect(out).not.toContain("const LIST_ENDPOINT = '/'")
  }
})

it('wires a generated page exactly like a hand-written one', () => {
  expect(buildLazyPageEntry('cafm')).toBe(
    "export const CafmPage = lazy(() => import('@/pages/cafm'))\n",
  )
  const route = buildRouteEntry('cafm')
  expect(route).toContain('path="/workspace/cafm"')
  expect(route).toContain('<Pages.CafmPage />')
  expect(route).toContain('<LazyRoute>')
  const nav = buildNavEntry('cafm', cafm)
  expect(nav).toContain("label: 'CAFM',")
  expect(nav).toContain("path: '/workspace/cafm',")
  expect(nav).toContain('icon: Boxes,')
})

it('binds the column mapping to the whole fallback, not just the inferred half', () => {
  // Without the parentheses `.map` attaches to inferColumns(rows) alone: a page with
  // columns would hand DataTable raw TableColumns and fail to compile.
  const out = buildServicePage('cafm', cafm)
  expect(out).toContain('(COLUMNS.length ? COLUMNS : inferColumns(rows)).map(')
})

it("emits source that already satisfies the app's prettier config", async () => {
  // `netix init` does not run a formatter, so a generated page that needs one would
  // fail the app's own `pnpm format:check` on its first commit.
  const prettier = await import('prettier')
  // The preset a scaffolded app actually extends, not this repo's own .prettierrc.
  const config = JSON.parse(
    readFileSync(new URL('../../presets/prettier.json', import.meta.url), 'utf8'),
  ) as Record<string, unknown>
  const source = buildServicePage('cafm', cafm)
  expect(await prettier.format(source, { ...config, filepath: 'app/pages/cafm.tsx' })).toBe(source)
})

it('names the page component after its file', () => {
  const out = buildServicePage('ml-engine', manifest.services['ml-engine']!)
  expect(out).toContain('export default function MlEnginePage()')
})
