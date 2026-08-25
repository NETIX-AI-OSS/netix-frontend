import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { Input } from '../primitives'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'

function Harness({
  required = true,
  message,
  hint,
}: {
  required?: boolean
  message?: string
  hint?: string
}) {
  const form = useForm<{ name: string }>({ defaultValues: { name: '' } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="name"
          rules={required ? { required: message ?? true } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Your full name</FormDescription>
              <FormMessage>{hint}</FormMessage>
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

describe('form', () => {
  it('wires label, control and description ids together', () => {
    render(<Harness required={false} />)
    const input = screen.getByLabelText('Name')
    expect(input.id).toMatch(/-form-item$/)
    expect(input).toHaveAttribute('aria-describedby', `${input.id}-description`)
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByText('Required')).not.toBeInTheDocument()
  })

  it('surfaces the validation message and flags the field on error', async () => {
    render(<Harness message="Required" />)
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    const input = await screen.findByLabelText('Name')
    expect(await screen.findByText('Required')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toContain('-message')
    expect(screen.getByText('Name')).toHaveAttribute('data-error', 'true')
  })

  it('renders nothing for an error carrying no message', async () => {
    const { container } = render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await screen.findByLabelText('Name')
    expect(container.querySelector('[data-slot="form-message"]')).toBeNull()
  })

  it('falls back to children when there is no error', () => {
    render(<Harness required={false} hint="Pick a name" />)
    expect(screen.getByText('Your full name')).toBeInTheDocument()
    expect(screen.getByText('Pick a name')).toBeInTheDocument()
  })
})
