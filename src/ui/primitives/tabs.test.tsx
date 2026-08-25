import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

describe('Tabs', () => {
  it('switches the visible panel', async () => {
    render(
      <Tabs defaultValue="a" className="root">
        <TabsList className="list">
          <TabsTrigger value="a" className="trigger">
            A
          </TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="content">
          Panel A
        </TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    )
    expect(document.querySelector('[data-slot="tabs"]')).toHaveClass('root')
    expect(document.querySelector('[data-slot="tabs-list"]')).toHaveClass('list')
    expect(screen.getByText('Panel A')).toHaveClass('content')
    await userEvent.click(screen.getByRole('tab', { name: 'B' }))
    expect(screen.getByText('Panel B')).toBeInTheDocument()
    expect(screen.queryByText('Panel A')).not.toBeInTheDocument()
  })
})
