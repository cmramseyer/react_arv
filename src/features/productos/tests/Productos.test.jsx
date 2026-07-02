import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'

import Productos from '@/features/productos/pages/Productos'

vi.mock('@/features/productos/components/ProductoList', () => ({
  default: () => <div data-testid="producto-list" />,
}))

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('Productos', () => {
  it('renders page title', () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /listado de productos/i })).toBeInTheDocument()
  })

  it('renders ProductoList', () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )

    expect(screen.getByTestId('producto-list')).toBeInTheDocument()
  })

  it('navigates to new product page when clicking Crear Producto', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/productos']}>
        <Productos />
        <LocationDisplay />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /crear producto/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/productos/new')
  })
})
