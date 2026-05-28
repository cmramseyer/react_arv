import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

// Mockear los servicios
vi.mock('../services/productosService', () => ({
  getProductos: vi.fn(() => Promise.resolve([])),
  createProducto: vi.fn(() => Promise.resolve()),
  updateProducto: vi.fn(() => Promise.resolve()),
  deleteProducto: vi.fn(() => Promise.resolve())
}))

import { getProductos, createProducto } from '../services/productosService'

import Productos from './Productos'
import ProductoNuevo from './ProductoNew'
import ProductoEditar from './ProductoEdit'

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

    render(
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

    render(
      <MemoryRouter initialEntries={['/productos']}>
        <Routes>
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id/editar" element={<div />} />
        </Routes>

        <LocationDisplay />
      </MemoryRouter>
    )

    expect(await screen.findByText('Glifosato')).toBeInTheDocument()

    await user.click(screen.getAllByText('Editar')[0])

    expect(screen.getByTestId('location')).toHaveTextContent('/productos/1/editar')

  })

  it('new redirects to New page', async () => {

    render(
      <MemoryRouter initialEntries={['/productos']}>
        <Routes>
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/nuevo" element={<div />} />
        </Routes>

        <LocationDisplay />
      </MemoryRouter>
    )

    expect(await screen.findByText('Glifosato')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /crear producto/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/productos/nuevo')

  })

})
