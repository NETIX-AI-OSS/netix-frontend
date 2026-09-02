// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readSchemaColumns, specPathFor } from './openapi'

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'netix-openapi-'))
  mkdirSync(join(root, 'schema'), { recursive: true })
})

afterEach(() => rmSync(root, { recursive: true, force: true }))

/** A DRF-shaped paginated list, the only response shape NETIX backends serve. */
const spec = (properties: string) => `openapi: 3.1.0
paths:
  /api/thing/:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedThingList'
components:
  schemas:
    PaginatedThingList:
      type: object
      properties:
        count: { type: integer }
        results:
          type: array
          items:
            $ref: '#/components/schemas/Thing'
    Thing:
      type: object
      properties:
${properties}
`

const write = (body: string) => {
  const path = specPathFor(root, 'thing-service')
  writeFileSync(path, body)
  return path
}

it('reads field names and render kinds through the paginated envelope', () => {
  const path = write(
    spec(`        id: { type: integer }
        name: { type: string }
        created_on: { type: string, format: date-time }
        is_active: { type: boolean }
        weight: { type: number }`),
  )
  expect(readSchemaColumns(path, '/api/thing/')).toEqual([
    { field: 'name', kind: 'text' },
    { field: 'id', kind: 'number' },
    { field: 'created_on', kind: 'date' },
    { field: 'is_active', kind: 'boolean' },
    { field: 'weight', kind: 'number' },
  ])
})

it('leads with the fields that identify a record, then keeps spec order', () => {
  const path = write(
    spec(`        id: { type: integer }
        created_on: { type: string, format: date }
        status: { type: string }
        name: { type: string }`),
  )
  expect(readSchemaColumns(path, '/api/thing/').map((c) => c.field)).toEqual([
    'name',
    'status',
    'id',
    'created_on',
  ])
})

it('drops fields with no sensible cell — objects, arrays and untyped blobs', () => {
  const path = write(
    spec(`        name: { type: string }
        asset_details: { type: object }
        tags: { type: array, items: { type: string } }
        request_metadata: {}
        nested: { $ref: '#/components/schemas/Thing' }`),
  )
  expect(readSchemaColumns(path, '/api/thing/')).toEqual([{ field: 'name', kind: 'text' }])
})

it('drops plumbing fields whatever their type', () => {
  const path = write(
    spec(`        name: { type: string }
        is_deleted: { type: boolean }
        organization_id: { type: integer }
        url: { type: string }
        attachment_urls: { type: string }`),
  )
  expect(readSchemaColumns(path, '/api/thing/')).toEqual([{ field: 'name', kind: 'text' }])
})

it('unwraps nullable unions to the type that carries the rendering', () => {
  const path = write(
    spec(`        description: { type: [string, 'null'] }
        scheduled_at: { type: [string, 'null'], format: date-time }
        count: { type: ['null', integer] }`),
  )
  expect(readSchemaColumns(path, '/api/thing/')).toEqual([
    { field: 'description', kind: 'text' },
    { field: 'scheduled_at', kind: 'date' },
    { field: 'count', kind: 'number' },
  ])
})

it('caps the column count so a 48-field record does not render 48 columns', () => {
  const fields = Array.from({ length: 30 }, (_, i) => `        f${i}: { type: string }`).join('\n')
  expect(readSchemaColumns(write(spec(fields)), '/api/thing/')).toHaveLength(7)
})

it('answers empty — never throws — when the spec cannot say', () => {
  // Each of these is a fallback case for the generator, not a scaffold failure.
  expect(readSchemaColumns(join(root, 'schema/missing.yaml'), '/api/thing/')).toEqual([])
  expect(readSchemaColumns(write('\t:\n  - [unbalanced'), '/api/thing/')).toEqual([])
  expect(readSchemaColumns(write('just a string'), '/api/thing/')).toEqual([])
  expect(readSchemaColumns(write(spec('        name: { type: string }')), '/api/other/')).toEqual(
    [],
  )
  // A detail route: a 200 with no `results` collection is not a table.
  expect(
    readSchemaColumns(
      write(`openapi: 3.1.0
paths:
  /api/thing/:
    get:
      responses:
        '200':
          content:
            application/json:
              schema: { type: object, properties: { id: { type: integer } } }
`),
      '/api/thing/',
    ),
  ).toEqual([])
})
