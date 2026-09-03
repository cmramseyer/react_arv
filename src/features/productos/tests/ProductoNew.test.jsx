import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import ProductoNew from '@/features/productos/pages/ProductoNew'

vi.mock('@/features/productos/components/ProductoForm', () => ({
  default: ({ formAction, onSuccess }) => (
    <div data-testid="producto-form">
      <div data-testid="form-action">{formAction}</div>
      <button type="button" onClick={onSuccess}>Fake success</button>
    </div>
  ),
}))

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('ProductoNew', () => {
  it('renders page title', () => {
    render(
      <MemoryRouter>
        <ProductoNew />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /nuevo producto/i })).toBeInTheDocument()
  })

  it('renders ProductoForm in create mode', () => {
    render(
      <MemoryRouter>
        <ProductoNew />
      </MemoryRouter>
    )

    expect(screen.getByTestId('producto-form')).toBeInTheDocument()
    expect(screen.getByTestId('form-action')).toHaveTextContent('create')
  })

  it('navigates to products page after form success', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/productos/new']}>
        <Routes>
          <Route path="/productos/new" element={<ProductoNew />} />
          <Route path="/productos" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /fake success/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/productos')
  })
})
