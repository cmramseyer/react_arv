import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import EstanciaForm from '@/features/estancias/components/EstanciaForm'

const renderForm = (props = {}) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()

  render(
    <EstanciaForm
      isSubmitting={false}
      onCancel={onCancel}
      onSubmit={onSubmit}
      submitLabel="Grabar"
      {...props}
    />,
  )

  return { onCancel, onSubmit }
}

describe('EstanciaForm', () => {
  it('resets fields from the supplied default values', () => {
    renderForm({
      defaultValues: {
        nombre: 'Estancia Uno',
        contacto: 'Contacto Uno',
        telefono: '12345678',
        email: 'estancia@uno.com',
      },
      submitLabel: 'Actualizar',
    })

    expect(screen.getByDisplayValue('Estancia Uno')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Contacto Uno')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12345678')).toBeInTheDocument()
    expect(screen.getByDisplayValue('estancia@uno.com')).toBeInTheDocument()
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

  it('calls onCancel when returning', async () => {
    const user = userEvent.setup()
    const { onCancel } = renderForm()

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(onCancel).toHaveBeenCalledOnce()
  })
})
