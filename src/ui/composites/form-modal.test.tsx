import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormModal } from './form-modal'

const open = async (name = 'Edit') => userEvent.click(screen.getByRole('button', { name }))

describe('FormModal', () => {
  it('opens from the default trigger and submits', async () => {
    const onSubmit = vi.fn()
    render(
      <FormModal onSubmit={onSubmit} header="Edit asset">
        <p>body</p>
      </FormModal>,
    )
    await open()
    expect(screen.getByText('Edit asset')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByText('body')).not.toBeInTheDocument())
  })

  it('keeps the dialog open when onSubmit returns false', async () => {
    render(
      <FormModal onSubmit={async () => false} actionButtonText="Apply">
        <p>body</p>
      </FormModal>,
    )
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('keeps the dialog open and clears the busy state when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('nope'))
    render(<FormModal onSubmit={onSubmit}>body</FormModal>)
    await open()
    const save = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(save)
    await waitFor(() => expect(save).toBeEnabled())
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('closes via cancel and reports it upward', async () => {
    const onOpenChange = vi.fn()
    render(
      <FormModal onSubmit={vi.fn()} onOpenChange={onOpenChange} cancelButtonText="Dismiss">
        body
      </FormModal>,
    )
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('honours a custom trigger, external open state and disabled', () => {
    render(
      <FormModal
        onSubmit={vi.fn()}
        open
        disabled
        trigger={<span>Open me</span>}
        overlayClassName="blur"
        className="wide"
      >
        body
      </FormModal>,
    )
    expect(screen.getByText('Open me')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('opens from a custom trigger', async () => {
    render(
      <FormModal onSubmit={vi.fn()} trigger={<span>Open me</span>}>
        body
      </FormModal>,
    )
    await userEvent.click(screen.getByText('Open me'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('hides the trigger entirely when asked', () => {
    render(
      <FormModal onSubmit={vi.fn()} hideTrigger triggerButtonText="Edit asset">
        body
      </FormModal>,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders nothing without the required permission and renders with it', () => {
    const { rerender } = render(
      <FormModal onSubmit={vi.fn()} permission="asset.change">
        body
      </FormModal>,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    rerender(
      <FormModal onSubmit={vi.fn()} permission="asset.change" hasPermission={() => true}>
        body
      </FormModal>,
    )
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})
