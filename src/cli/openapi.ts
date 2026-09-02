import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parse } from 'yaml'

/**
 * Reads the columns a generated service page should render out of the service's OpenAPI spec.
 *
 * Columns must come from the API contract, not from the first row: a collection that
 * happens to be empty would otherwise render a table with no headers and no shape at
 * all. The spec also knows each field's type and format, so the generated page can
 * format dates, booleans and numbers per column instead of sniffing values.
 */
export type SchemaColumn = {
  /** Response field name. */
  field: string
  /** How the generated cell renders the value. */
  kind: 'text' | 'number' | 'boolean' | 'date'
}

/** Fields that are plumbing rather than content, whatever their type. */
const SKIP_EXACT = new Set(['is_deleted', 'organization_id', 'url', 'password', 'attachment_urls'])
const SKIP_SUFFIX = ['_details', '_metadata', '_urls']

/**
 * The order a person reads a record in: what it is, then how it is doing, then who and
 * when. Everything unlisted keeps spec order behind these.
 */
const LEAD_FIELDS = [
  'name',
  'title',
  'label',
  'display_name',
  'code',
  'reference',
  'description',
  'status',
  'state',
  'priority',
  'type',
  'category',
  'email',
]

const MAX_COLUMNS = 7

type SchemaNode = Record<string, unknown>

/** OpenAPI allows `type: [x, 'null']`; the null carries no rendering information. */
const nonNullType = (node: SchemaNode): string | undefined => {
  const type = node.type
  if (typeof type === 'string') return type
  if (Array.isArray(type)) return type.find((entry) => entry !== 'null') as string | undefined
  return undefined
}

const kindOf = (node: SchemaNode): SchemaColumn['kind'] | undefined => {
  const type = nonNullType(node)
  if (type === 'boolean') return 'boolean'
  if (type === 'integer' || type === 'number') return 'number'
  if (type === 'string')
    return node.format === 'date-time' || node.format === 'date' ? 'date' : 'text'
  return undefined
}

/** `#/components/schemas/Foo` → the node it points at; one hop, which is all DRF emits. */
const deref = (spec: SchemaNode, node: SchemaNode | undefined): SchemaNode | undefined => {
  if (!node) return undefined
  const ref = node.$ref
  if (typeof ref !== 'string') return node
  const name = ref.split('/').pop()
  if (!name) return undefined
  const components = spec.components as SchemaNode | undefined
  const schemas = components?.schemas as Record<string, SchemaNode> | undefined
  return schemas?.[name]
}

/**
 * Walks `paths[endpoint].get` → 200 → `results[]` item schema. Returns undefined for
 * anything that is not a paginated collection, so the caller can fall back.
 */
function rowSchema(spec: SchemaNode, endpoint: string): SchemaNode | undefined {
  const paths = spec.paths as Record<string, SchemaNode> | undefined
  const get = paths?.[endpoint]?.get as SchemaNode | undefined
  const responses = get?.responses as Record<string, SchemaNode> | undefined
  const content = responses?.['200']?.content as Record<string, SchemaNode> | undefined
  const envelope = deref(spec, content?.['application/json']?.schema as SchemaNode | undefined)
  const envelopeProps = envelope?.properties as Record<string, SchemaNode> | undefined
  const results = envelopeProps?.results
  if (!results) return undefined
  return deref(spec, results.items as SchemaNode | undefined)
}

/**
 * The columns for `endpoint`, or an empty list when the spec cannot answer — a missing
 * file, an unparseable one, or a route that is not a paginated collection. The caller
 * treats empty as "no schema", never as "no columns".
 */
export function readSchemaColumns(specPath: string, endpoint: string): SchemaColumn[] {
  if (!existsSync(specPath)) return []
  let spec: SchemaNode
  try {
    spec = parse(readFileSync(specPath, 'utf8')) as SchemaNode
  } catch {
    // A half-written or non-YAML spec is a fallback case, not a scaffold failure.
    return []
  }
  if (!spec || typeof spec !== 'object') return []

  const row = rowSchema(spec, endpoint)
  const properties = row?.properties as Record<string, SchemaNode> | undefined
  if (!properties) return []

  const candidates: SchemaColumn[] = []
  for (const [field, node] of Object.entries(properties)) {
    if (SKIP_EXACT.has(field)) continue
    if (SKIP_SUFFIX.some((suffix) => field.endsWith(suffix))) continue
    const kind = kindOf(node)
    if (!kind) continue
    candidates.push({ field, kind })
  }

  const rank = (field: string) => {
    const index = LEAD_FIELDS.indexOf(field)
    return index === -1 ? LEAD_FIELDS.length : index
  }
  // Stable sort: lead fields in their listed order, everything else in spec order.
  return candidates.sort((a, b) => rank(a.field) - rank(b.field)).slice(0, MAX_COLUMNS)
}

/** `<app>/schema/<slug>.yaml`, where `schema pull` puts each service's spec. */
export const specPathFor = (root: string, slug: string) => join(root, 'schema', `${slug}.yaml`)
