import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

describe('Table', () => {
  it('renders every slot inside a scroll container', () => {
    render(
      <Table className="root">
        <TableCaption className="caption">Cap</TableCaption>
        <TableHeader className="head">
          <TableRow className="hrow">
            <TableHead className="th">Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="body">
          <TableRow>
            <TableCell className="td">Val</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter className="foot">
          <TableRow>
            <TableCell>Sum</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )
    expect(document.querySelector('[data-slot="table-container"]')).toHaveClass('overflow-x-auto')
    expect(screen.getByRole('table')).toHaveClass('root')
    for (const [slot, cls] of [
      ['table-caption', 'caption'],
      ['table-header', 'head'],
      ['table-body', 'body'],
      ['table-footer', 'foot'],
      ['table-head', 'th'],
      ['table-cell', 'td'],
    ] as const) {
      expect(document.querySelector(`[data-slot="${slot}"]`)).toHaveClass(cls)
    }
    expect(document.querySelector('[data-slot="table-row"]')).toHaveClass('hrow')
  })
})
