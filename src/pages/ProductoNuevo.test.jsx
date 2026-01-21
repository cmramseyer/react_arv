import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Mockear los servicios
vi.mock('../services/productosService', () => ({
  createProducto: vi.fn(() => Promise.resolve()),
}))

import { createProducto } from '../services/productosService'

import ProductoNuevo from './ProductoNuevo'

function ProductosMock() {
  return <h1>Productos</h1>
}

let user

describe('Nuevo Producto', () => {
  beforeEach(() => {
    user = userEvent.setup()
    createProducto.mockClear()
  })

  it('creates a new Producto', async () => {

    render(
      <MemoryRouter initialEntries={['/productos/nuevo']}>
        <Routes>
          <Route path="/productos/nuevo" element={<ProductoNuevo />} />
          <Route path="/productos" element={<ProductosMock />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Kilogramos' }))
    await user.type(screen.getByLabelText('Nombre'), 'Roundup')
    await user.type(screen.getByLabelText('Tipo de producto'), 'Agroquimico')

    const botonCrear = screen.getByRole('button', { name: /crear/i })

    await user.click(botonCrear)

    await waitFor(() => {
      expect(createProducto).toHaveBeenCalledTimes(1)
    })

    expect(createProducto).toHaveBeenCalledWith({
      nombre: 'Roundup',
      tipo_producto: 'Agroquimico',
      unidad_medida: 'kg',
    })

    expect(await screen.findByRole('heading', { name: /productos/i })).toBeInTheDocument()

  })

  it('show errors when form is not complete', async () => {

    render(
      <MemoryRouter>
        <ProductoNuevo />
      </MemoryRouter>
    )

    const botonCrear = screen.getByRole('button', { name: /crear/i })
    await user.click(botonCrear)
  
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('El tipo de producto es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('La unidad de medida es obligatoria')).toBeInTheDocument()
  })

})