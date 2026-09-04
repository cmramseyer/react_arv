import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import ProductoForm from '@/features/productos/components/ProductoForm'

const renderForm = (props = {}) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)

  render(
    <ProductoForm
      isSubmitting={false}
      onSubmit={onSubmit}
      submitLabel="Guardar"
      {...props}
    />,
  )

  return { onSubmit }
}

describe('ProductoForm', () => {
  it('resets fields from the supplied default values', () => {
    renderForm({
      defaultValues: {
        nombre: 'Roundup',
        tipo_producto: 'Agroquímico',
        unidad_medida: 'kg',
      },
      submitLabel: 'Actualizar',
    })

    expect(screen.getByDisplayValue('Roundup')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Agroquímico')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument()
  })

  it('validates form data before submitting', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('El tipo de producto es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('La unidad de medida es obligatoria')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows its loading state inside the submit button', () => {
    renderForm({ isSubmitting: true })

    const submitButton = screen.getByRole('button', { name: /cargando/i })
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('Guardar')).not.toBeInTheDocument()
  })
})
