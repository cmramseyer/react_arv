import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import MaquinistaForm from '@/features/maquinistas/components/MaquinistaForm'

const renderForm = (props = {}) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)

  render(
    <MaquinistaForm
      isSubmitting={false}
      onSubmit={onSubmit}
      submitLabel="Grabar"
      {...props}
    />,
  )

  return { onSubmit }
}

describe('MaquinistaForm', () => {
  it('resets fields from the supplied default values', () => {
    renderForm({
      defaultValues: { nombre: 'Carlos' },
      submitLabel: 'Actualizar',
    })

    expect(screen.getByDisplayValue('Carlos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument()
  })

  it('validates form data before submitting', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: /grabar/i }))

    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows its loading state inside the submit button', () => {
    renderForm({ isSubmitting: true })

    const submitButton = screen.getByRole('button', { name: /cargando/i })
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('Grabar')).not.toBeInTheDocument()
  })
})
