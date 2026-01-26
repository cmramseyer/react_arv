import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/productosService', () => ({
  getProducto: vi.fn(),
  updateProducto: vi.fn(),
}))

import { getProducto, updateProducto } from '../services/productosService'
import ProductoEditar from './ProductoEditar'

const productoFixture = {
  id: 1,
  nombre: 'Roundup',
  tipo_producto: 'Agroquimico',
  unidad_medida: 'kg',
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('ProductoEditar', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getProducto.mockResolvedValueOnce(productoFixture)
  })

  it('returns to Productos without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/productos', '/productos/1/editar']} initialIndex={1}>
        <Routes>
          <Route path="/productos" element={<div>Productos Page</div>} />
          <Route path="/productos/:id/editar" element={<ProductoEditar />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('Roundup')

    const getProductoCalls = getProducto.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/productos')
    expect(updateProducto).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(getProducto).toHaveBeenCalledTimes(getProductoCalls)
    })
  })
})
