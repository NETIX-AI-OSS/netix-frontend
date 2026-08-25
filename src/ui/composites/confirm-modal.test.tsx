import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Trash2 } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmModal } from './confirm-modal'

describe('ConfirmModal', () => {
  it('confirms and closes', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal onConfirm={onConfirm}>Delete it?</ConfirmModal>)
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByText('Delete it?')).not.toBeInTheDocument())
  })

  it('stays open and re-enables when onConfirm rejects', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('nope'))
    render(
      <ConfirmModal onConfirm={onConfirm} triggerText="Delete" triggerIcon={Trash2}>
        Delete it?
      </ConfirmModal>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const confirm = screen.getByRole('button', { name: 'Confirm' })
    await userEvent.click(confirm)
    await waitFor(() => expect(confirm).toBeEnabled())
    expect(screen.getByText('Delete it?')).toBeInTheDocument()
  })

  it('shows an optional cancel button that closes the dialog', async () => {
    render(
      <ConfirmModal onConfirm={vi.fn()} showCancelButton cancelText="Not now">
        Delete it?
      </ConfirmModal>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }))
    await waitFor(() => expect(screen.queryByText('Delete it?')).not.toBeInTheDocument())
  })

  it('renders a custom trigger and can be disabled', () => {
    render(
      <ConfirmModal
        onConfirm={vi.fn()}
        trigger={<span>Remove</span>}
        triggerClassName="inline"
        disabled
        confirmVariant="destructive"
        triggerVariant="ghost"
      >
        Delete it?
      </ConfirmModal>,
    )
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('opens from a custom trigger', async () => {
    render(
      <ConfirmModal onConfirm={vi.fn()} trigger={<span>Remove</span>}>
        Delete it?
      </ConfirmModal>,
    )
    await userEvent.click(screen.getByText('Remove'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('is hidden without the required permission', () => {
    const { rerender } = render(
      <ConfirmModal onConfirm={vi.fn()} permission="asset.delete">
        Delete it?
      </ConfirmModal>,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    rerender(
      <ConfirmModal onConfirm={vi.fn()} permission="asset.delete" hasPermission={() => true}>
        Delete it?
      </ConfirmModal>,
    )
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })
})
