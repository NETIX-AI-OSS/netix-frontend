import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TreeView, type TreeViewItem } from '.'

const items: TreeViewItem[] = [
  { id: '1', label: 'Root', children: [{ id: '1-1', label: 'Child' }] },
  { id: '2', label: 'Leaf' },
]

describe('TreeView', () => {
  it('renders the empty slot', () => {
    render(<TreeView items={[]} className="pad" emptyText="Nothing" />)
    expect(screen.getByText('Nothing')).toBeInTheDocument()
  })

  it('defaults the empty copy', () => {
    render(<TreeView items={[]} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('expands everything by default and collapses on toggle', async () => {
    const onItemToggle = vi.fn()
    render(<TreeView items={items} onItemToggle={onItemToggle} />)
    expect(screen.getByText('Child')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Collapse Root' }))
    expect(onItemToggle).toHaveBeenCalledWith(items[0], false)
    expect(screen.queryByText('Child')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Expand Root' }))
    expect(onItemToggle).toHaveBeenLastCalledWith(items[0], true)
  })

  it('starts collapsed when defaultExpandAll is off and prunes stale ids', async () => {
    const { rerender } = render(<TreeView items={items} defaultExpandAll={false} />)
    expect(screen.queryByText('Child')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Expand Root' }))
    expect(screen.getByText('Child')).toBeInTheDocument()

    // A reload that still carries the node keeps it expanded; one that drops it prunes the id.
    rerender(<TreeView items={[...items]} defaultExpandAll={false} />)
    expect(screen.getByText('Child')).toBeInTheDocument()

    rerender(
      <TreeView
        items={[{ id: '9', label: 'Other', hasChildren: true }]}
        defaultExpandAll={false}
      />,
    )
    expect(screen.getByRole('button', { name: 'Expand Other' })).toBeInTheDocument()
  })

  it('selects an item and marks it', async () => {
    const onItemSelect = vi.fn()
    render(<TreeView items={items} selectedId="2" onItemSelect={onItemSelect} />)
    await userEvent.click(screen.getByRole('button', { name: 'Leaf' }))
    expect(onItemSelect).toHaveBeenCalledWith(items[1])
    expect(screen.getAllByRole('treeitem')[2]).toHaveAttribute('aria-selected', 'true')
  })

  it('shows the loading copy for a node being fetched', () => {
    render(
      <TreeView
        items={[{ id: '1', label: 'Root', hasChildren: true }]}
        loadingItemIds={['1']}
        labels={{ loadingChildren: 'Fetching…' }}
      />,
    )
    expect(screen.getByText('Fetching…')).toBeInTheDocument()
  })

  it('shows the no-children copy once loaded', () => {
    render(
      <TreeView
        items={[{ id: '1', label: 'Root', hasChildren: true, childrenLoaded: true }]}
        labels={{ noChildNodes: 'Empty branch' }}
      />,
    )
    expect(screen.getByText('Empty branch')).toBeInTheDocument()
  })

  it('stays silent while children have not been loaded yet', () => {
    render(
      <TreeView items={[{ id: '1', label: 'Root', hasChildren: true, childrenLoaded: false }]} />,
    )
    expect(screen.queryByText('No child nodes')).not.toBeInTheDocument()
  })
})
