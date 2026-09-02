/**
 * The per-service files `netix init` writes into a scaffolded app.
 *
 * These are generated boilerplate, not app code the template hand-maintains:
 * every service's client is the same sixteen lines with the names swapped, so
 * the generator owns the shape and the template stays free of any example
 * service. Keeping them here (next to the `netix-frontend/api` they call) also
 * means the CLI no longer reads app source to clone it.
 */

import type { SchemaColumn } from './openapi'
import type { ServiceConfig } from './transforms'
import { pageNames, serviceNames } from './transforms'

/** `app/client/http-<svc>-service-client.ts` — the orval mutator for one service. */
export function buildServiceClient(key: string): string {
  const { slug, screaming, camel, pascal } = serviceNames(key)
  return `import { createHttpClient, createMutator } from 'netix-frontend/api'
import { ENV } from '@/config/env'
import { getAccessToken } from '@/lib/auth'

export const ${screaming}_BASE_URL = ENV.api.${camel}

export const AXIOS_INSTANCE = createHttpClient({
  baseURL: ${screaming}_BASE_URL,
  // The app's envoy-ts-auth seam: the session token, or null before sign-in.
  getToken: getAccessToken,
  error: { clientName: '${slug}' },
  // retryServerErrors mirrors the fleet transport policy (5xx retried).
  retry: { retryServerErrors: true },
})

/** Orval mutator for the generated ${slug} client. */
export const http${pascal}Client = createMutator(AXIOS_INSTANCE)

export default http${pascal}Client
`
}

/**
 * `app/client/http-<svc>-service-client.test.ts` — pins the shared interceptors
 * (error envelope → ApiError, 403 without logout, response-less failure) to the
 * app's own wiring, so a lib upgrade that changes them fails here first.
 */
export function buildServiceClientTest(key: string): string {
  const { slug } = serviceNames(key)
  return `import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it } from 'vitest'
import { AXIOS_INSTANCE } from './http-${slug}-client'

/** Adapter that fails without touching the network, so the shared interceptors still run. */
function failWith(status: number, data: unknown) {
  return async (config: InternalAxiosRequestConfig) => {
    const response = {
      data,
      status,
      statusText: '',
      headers: new AxiosHeaders(),
      config,
    }
    throw new AxiosError('Request failed', String(status), config, {}, response)
  }
}

describe('${slug} client', () => {
  it('maps an error envelope onto ApiError', async () => {
    await expect(
      AXIOS_INSTANCE.get('/x', {
        adapter: failWith(400, { messages: ['Bad thing'] }),
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 400,
      messages: ['Bad thing'],
      context: { client: '${slug}' },
    })
  })

  it('throws instead of logging out on 403', async () => {
    await expect(AXIOS_INSTANCE.get('/x', { adapter: failWith(403, {}) })).rejects.toMatchObject({
      statusCode: 403,
      messages: ['You do not have permission to perform this action'],
    })
  })

  it('reports a response-less failure as status 0', async () => {
    const adapter = async (config: InternalAxiosRequestConfig) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    }
    // POST is not idempotent, so the transport retry does not re-dispatch it.
    await expect(AXIOS_INSTANCE.post('/x', {}, { adapter })).rejects.toMatchObject({
      statusCode: 0,
      messages: ['Network error occurred'],
    })
  })

  it('rides the app auth seam: no bearer header without a session', async () => {
    // Auth is never initialized under test, so getAccessToken resolves null.
    let sent: InternalAxiosRequestConfig | undefined
    const adapter = async (config: InternalAxiosRequestConfig) => {
      sent = config
      return failWith(400, {})(config)
    }
    await expect(AXIOS_INSTANCE.get('/x', { adapter })).rejects.toMatchObject({ statusCode: 400 })
    expect(sent?.headers.Authorization).toBeUndefined()
  })
})
`
}

/** One `orval.config.ts` entry, indented to sit inside `defineConfig({ … })`. */
export function buildOrvalBlock(key: string): string {
  const { slug, pascal } = serviceNames(key)
  return `  '${slug}': {
    input: './schema/${slug}.yaml',
    output: {
      target: './app/client/gen/${slug}/index.ts',
      schemas: './app/client/gen/${slug}',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: './app/client/http-${slug}-client.ts',
          name: 'http${pascal}Client',
        },
      },
    },
  },
`
}

/**
 * `app/pages/<key>.tsx` — an ordinary page, generated: a paginated `@netix/data-table`
 * over the service's client via TanStack Query. It is wired exactly like a hand-written
 * page (a lazy export, a route, a navigation entry), so removing it is deleting the file
 * and its three lines. It opens on the service's `listEndpoint` from services.json — a
 * real paginated route, so a freshly scaffolded page renders rows instead of a 404.
 *
 * Columns come from the service's OpenAPI spec (`readSchemaColumns`), so the table
 * keeps its headers, widths and per-type formatting even when the collection is
 * empty or still loading. `columns` is empty only when no spec was on disk at
 * generation time (`--no-schemas`); the page then falls back to inferring them from
 * the first row, which is strictly worse and says so.
 */
export function buildServicePage(
  key: string,
  service: ServiceConfig,
  columns: SchemaColumn[] = [],
): string {
  const { slug } = serviceNames(key)
  const { component } = pageNames(key)
  const title = service.title
  const fromSchema = columns.length > 0

  const columnSource = fromSchema
    ? `// Columns come from the API contract — schema/${slug}.yaml, the response schema of
// ${service.listEndpoint} — not from the rows. That is what keeps the header row, the
// column widths and the per-type formatting in place while the first page loads and when
// the collection comes back empty. This is ordinary source: reorder it, drop fields, add
// a \`meta.filter\` (see @netix/data-table), or regenerate with \`netix schema pull\`.
const COLUMNS: TableColumn[] = [
${columns.map(({ field, kind }) => `  { field: '${field}', kind: '${kind}' },`).join('\n')}
]`
    : `// No spec was on disk when this page was generated (netix init --no-schemas), so there is
// no contract to read columns from and they are inferred from the first row instead. That
// means an empty collection renders an empty table. Run \`netix schema pull\`, then delete
// this file and re-run \`netix service add ${key}\` to generate real columns.
const INFERRED_MAX = 7
const COLUMNS: TableColumn[] = []

const inferColumns = (rows: Row[]): TableColumn[] => {
  const first = rows[0]
  if (!first) return []
  return Object.keys(first)
    .filter((field) => first[field] === null || typeof first[field] !== 'object')
    .slice(0, INFERRED_MAX)
    .map((field) => ({ field, kind: 'text' }) as TableColumn)
}`

  // Parenthesised: without it the trailing `.map` below binds to inferColumns(rows) alone,
  // so a non-empty COLUMNS would skip the mapping entirely (and not typecheck).
  const columnsExpr = fromSchema ? 'COLUMNS' : '(COLUMNS.length ? COLUMNS : inferColumns(rows))'
  const columnsDeps = fromSchema ? '[t, locale]' : '[rows, t, locale]'

  return `import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Boxes, Database, Hash, Rows3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageBreadcrumbs } from '@/components/application/breadcrumbs'
import { DataTable, type DataTableColumn } from '@/components/composites/data-table'
import type { FilterValues } from '@/components/composites/data-table'
import { EmptyState } from '@/components/composites/empty-state'
import { FeedbackState } from '@/components/application/feedback-state'
import { PageLayout } from '@/components/application/layout'
import { OverviewBanner, StatTile } from '@/components/application/overview-banner'
import { WorkspaceSidebar } from '@/components/application/sidebar'
import { AXIOS_INSTANCE } from '@/client/http-${slug}-client'
import { Badge } from '@/components/ui/badge'
import { formatLabel } from '@/lib/utils'

const PAGE_SIZE = 10
// The service's headline collection, from services.json. Swap it for the route this
// service page is really about — schema/${slug}.yaml lists them, and the typed hooks for
// every one live in app/client/gen/${slug}.
const LIST_ENDPOINT = '${service.listEndpoint}'

type Row = Record<string, unknown>
type ListResponse = { count: number; results: Row[] }
type TableColumn = { field: string; kind: 'text' | 'number' | 'boolean' | 'date' }

${columnSource}

/** Formats by declared type rather than by sniffing the value, so a column reads the same in every row. */
const formatCell = (
  value: unknown,
  kind: TableColumn['kind'],
  translate: (key: string) => string,
  locale: string,
): string => {
  if (value === null || value === undefined || value === '') return '—'
  if (kind === 'boolean') return translate(value ? 'yes' : 'no')
  if (kind === 'number')
    return typeof value === 'number' ? value.toLocaleString(locale) : String(value)
  if (kind === 'date') {
    const parsed = new Date(String(value))
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString(locale)
  }
  if (typeof value === 'object') return Array.isArray(value) ? String(value.length) : '…'
  return String(value)
}

/** File scope keeps the component identity stable across renders of the page. */
function NoRows() {
  const { t } = useTranslation()
  // The header row above already carries the table's shape, so the empty state sits
  // close under it instead of pushing the card open.
  return <EmptyState className="mt-12 mb-10" text={t('noMatches')} />
}

export default function ${component}() {
  const { t, i18n } = useTranslation()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE })
  const [filters, setFilters] = useState<FilterValues | undefined>({})
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ['${slug}', LIST_ENDPOINT, pagination, filters],
    queryFn: async ({ signal }) => {
      const response = await AXIOS_INSTANCE.get<ListResponse>(LIST_ENDPOINT, {
        params: {
          ...(filters ?? {}),
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
        },
        signal,
      })
      return response.data
    },
    // Paging keeps the current rows on screen; DataTable dims them until the next page lands.
    placeholderData: keepPreviousData,
  })

  const locale = i18n.language
  const rows = useMemo(() => data?.results ?? [], [data])
  const columns = useMemo<DataTableColumn<Row>[]>(
    () =>
      ${columnsExpr}.map(({ field, kind }, index) => ({
        id: field,
        accessorFn: (row: Row) => row[field],
        header: formatLabel(field),
        // DataTable lays the table out from getTotalSize(), so unsized columns collapse.
        size: index === 0 ? 280 : 170,
        // Django-filter exposes ID lookups as comma-separated field__in values.
        ...(field === 'id' || field.endsWith('_id')
          ? { meta: { filter: { key: field === 'id' ? 'id__in' : field + '__in' } } }
          : {}),
        cell: (context) => {
          const text = formatCell(context.getValue(), kind, (id) => t(id), locale)
          return (
            <span className="block truncate" title={text}>
              {text}
            </span>
          )
        },
      })),
    ${columnsDeps},
  )

  return (
    <PageLayout sidebar={<WorkspaceSidebar />} breadcrumbs={<PageBreadcrumbs />}>
      {isError ? (
        <FeedbackState type="error" onRetry={() => void refetch()} />
      ) : (
        <>
          <OverviewBanner
            icon={Boxes}
            title="${title}"
            badge={<Badge variant="secondary">{isFetching ? 'Updating' : 'Live collection'}</Badge>}
            description="Browse and manage ${title.toLowerCase()} records."
          >
            <StatTile
              label="Total records"
              value={data ? data.count.toLocaleString(locale) : '—'}
              detail="Across this service"
              icon={Database}
            />
            <StatTile
              label="On this page"
              value={rows.length.toLocaleString(locale)}
              detail={isFetching ? 'Refreshing' : 'Loaded'}
              icon={Rows3}
            />
            <StatTile
              label="Current page"
              value={(pagination.pageIndex + 1).toLocaleString(locale)}
              detail={pagination.pageSize + ' rows per page'}
              icon={Hash}
            />
          </OverviewBanner>
          <DataTable
            data={rows}
            columns={columns}
            getRowId={(row, index) => String(row.id ?? index)}
            state={{
              pagination,
              columnPinning: { start: columns[0]?.id ? [columns[0].id] : [], end: [] },
            }}
            onPaginationChange={setPagination}
            filtering={{
              filters,
              updateFilters: (updater) => {
                setPagination((current) => ({ ...current, pageIndex: 0 }))
                setFilters(updater)
              },
            }}
            rowCount={data?.count ?? 0}
            // The query already fetches one page at a time; DataTable must not slice again.
            manualPagination
            heightAuto
            pagination={{ pageSizeOptions: [10, 25, 50, 100] }}
            loading={isFetching}
            // Skeleton rows on the first load (there is nothing to keep), a dimming
            // overlay once there is a page on screen worth keeping.
            loadingMode={isPending ? 'skeleton' : 'overlay'}
            EmptyComponent={NoRows}
          />
        </>
      )}
    </PageLayout>
  )
}
`
}

/** One lazy export for `app/pages/lazy.ts`. */
export function buildLazyPageEntry(key: string): string {
  const { component, importPath } = pageNames(key)
  return `export const ${component} = lazy(() => import('${importPath}'))\n`
}

/** One `<Route>` for `app/main.tsx`, indented to sit inside the layout route. */
export function buildRouteEntry(key: string): string {
  const { component, path } = pageNames(key)
  return `              <Route
                path="${path}"
                element={
                  <LazyRoute>
                    <Pages.${component} />
                  </LazyRoute>
                }
              />\n`
}

/** One `NAVIGATION` entry for `app/lib/navigation.ts`, under the workspace area. */
export function buildNavEntry(key: string, service: ServiceConfig): string {
  const { path } = pageNames(key)
  return `      {
        label: '${service.title}',
        description: 'Browse and manage ${service.title.toLowerCase()} records.',
        path: '${path}',
        icon: Boxes,
      },\n`
}

/** One `ENV.api` entry for `app/config/env.ts`. */
export function buildEnvApiEntry(key: string, service: ServiceConfig): string {
  const { camel } = serviceNames(key)
  return `      ${camel}: serviceUrl('${service.apiSubdomain}', '/${key}-api'),\n`
}

/** One `devUpstreams` entry for `vite.config.ts`. */
export function buildDevUpstreamEntry(key: string, service: ServiceConfig): string {
  return `    '/${key}-api': \`https://${service.apiSubdomain}.\${baseDomain}\`,\n`
}
