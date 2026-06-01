import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { getProductos, createProducto } from '@/services/productosService'

import Productos from './Productos'

const renderWithQueryClient = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

let user

const mockProductos = () => {
  getProductos.mockResolvedValueOnce([
    { id: 1, nombre: 'Glifosato', tipo_producto: 'Agroquimico', unidad_medida: 'litros' }
  ])
}

describe('Productos', () => {
  beforeEach(() => {
    user = userEvent.setup()
    getProductos.mockClear()
    createProducto.mockClear()
    mockProductos()
  })

  it('renders page', async () => {

    mockProductos()

    renderWithQueryClient(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getProductos).toHaveBeenCalled()
    })

    await screen.findByText('Glifosato')

    expect(screen.getByRole('columnheader', { name: 'Tipo' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Unidad' })).toBeInTheDocument()
    expect(screen.getByText('Crear Producto')).toBeInTheDocument()
  })

  it('edit redirects to Edit page', async () => {

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/productos']}>
        <Routes>
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id/edit" element={<div />} />
        </Routes>

        <LocationDisplay />
      </MemoryRouter>
    )

    expect(await screen.findByText('Glifosato')).toBeInTheDocument()

    await user.click(screen.getAllByText('Editar')[0])

    expect(screen.getByTestId('location')).toHaveTextContent('/productos/1/edit')

  })

  it('new redirects to New page', async () => {

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/productos']}>
        <Routes>
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/new" element={<div />} />
        </Routes>

        <LocationDisplay />
      </MemoryRouter>
    )

    expect(await screen.findByText('Glifosato')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /crear producto/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/productos/new')

  })

})
