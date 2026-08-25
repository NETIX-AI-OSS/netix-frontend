import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb'

describe('Breadcrumb', () => {
  it('renders the full trail with the default separator', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList className="list">
          <BreadcrumbItem className="item">
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="sep" />
          <BreadcrumbItem>
            <BreadcrumbEllipsis className="ell" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage className="page">Now</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="breadcrumb-list"]')).toHaveClass('list')
    expect(document.querySelector('[data-slot="breadcrumb-item"]')).toHaveClass('item')
    expect(
      document.querySelector('[data-slot="breadcrumb-separator"]')?.querySelector('svg'),
    ).toBeTruthy()
    expect(document.querySelector('[data-slot="breadcrumb-ellipsis"]')).toHaveClass('ell')
    expect(screen.getByText('Now')).toHaveAttribute('aria-current', 'page')
  })

  it('honours a custom separator and asChild links', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button type="button">Back</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByRole('button', { name: 'Back' })).toHaveAttribute(
      'data-slot',
      'breadcrumb-link',
    )
    expect(document.querySelector('[data-slot="breadcrumb-separator"]')).toHaveTextContent('/')
  })
})
