import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import ProductoEdit from '@/features/productos/pages/ProductoEdit'

vi.mock('@/features/productos/components/ProductoForm', () => ({
  default: ({ formAction, id }) => (
    <div data-testid="producto-form">
      <div data-testid="form-action">{formAction}</div>
      <div data-testid="producto-id">{id}</div>
    </div>
  ),
}))

const renderProductoEdit = () => {
  return render(
    <MemoryRouter initialEntries={['/productos/123/edit']}>
      <Routes>
        <Route path="/productos/:id/edit" element={<ProductoEdit />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProductoEdit', () => {
  it('renders page title', () => {
    renderProductoEdit()

    expect(screen.getByRole('heading', { name: /editar producto/i })).toBeInTheDocument()
  })

  it('uses id from route params', () => {
    renderProductoEdit()

    expect(screen.getByTestId('producto-id')).toHaveTextContent('123')
  })

  it('renders ProductoForm in edit mode', () => {
    renderProductoEdit()

    expect(screen.getByTestId('producto-form')).toBeInTheDocument()
    expect(screen.getByTestId('form-action')).toHaveTextContent('edit')
  })
})
