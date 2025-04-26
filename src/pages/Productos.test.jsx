import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mockear los servicios
jest.mock('../services/productosService', () => ({
  getProductos: jest.fn(() => Promise.resolve([])),
  createProducto: jest.fn(() => Promise.resolve()),
  updateProducto: jest.fn(() => Promise.resolve()),
  deleteProducto: jest.fn(() => Promise.resolve())
}))

import { getProductos, createProducto } from '../services/productosService'

import Productos from './Productos'

const mockProductos = () => {
  getProductos.mockResolvedValueOnce([
    { id: 1, nombre: 'Glifosato', tipo_producto: 'Agroquimico', unidad_medida: 'litros' }
  ])
}

describe('Productos Form', () => {
  beforeEach(() => {
    getProductos.mockClear()
    createProducto.mockClear()
    mockProductos()
  })

  it('renderiza el formulario correctamente', async () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getProductos).toHaveBeenCalled()
    })    

    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Tipo de producto')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
  })

  it('puede crear un nuevo Producto', async () => {

    await waitFor(() => {
      expect(getProductos).toHaveBeenCalledTimes(0)
    })

    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getProductos).toHaveBeenCalledTimes(1)
    })

    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Roundup')
    await userEvent.type(screen.getByPlaceholderText('Tipo de producto'), 'Agroquimico')
    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      'kg'
    )

    const botonCrear = screen.getByRole('button', { name: /crear/i })

    getProductos.mockResolvedValueOnce([
      { id: 1, nombre: 'Glifosato', tipo_producto: 'Agroquimico', unidad_medida: 'litros' },
      { id: 2, nombre: 'Roundup', tipo_producto: 'Agroquimico', unidad_medida: 'kg' }
    ])

    await userEvent.click(botonCrear)

    await waitFor(() => {
      expect(createProducto).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(getProductos).toHaveBeenCalledTimes(2)
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre')).toHaveValue('')
      expect(screen.getByPlaceholderText('Tipo de producto')).toHaveValue('')
    })
    expect(await screen.findByText('Roundup')).toBeInTheDocument()

  })

  it('muestra errores si los campos no se completan', async () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )
      
    const botonCrear = screen.getByRole('button', { name: /crear/i })
    fireEvent.click(botonCrear)
  
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('El tipo de producto es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('La unidad de medida es obligatoria')).toBeInTheDocument()
  })

  it('muestra Productos, permite editar uno y llena el formulario', async () => {
    mockProductos()
  
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )
  
    // Esperar que cargue el listado de Productos
    expect(await screen.findByText('Glifosato')).toBeInTheDocument()
  
    // Simulamos hacer click en el botón Editar del primer Producto
    fireEvent.click(screen.getAllByText('Editar')[0])
  
    // Verificamos que el formulario se llene con los datos correctos
    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Glifosato')
    expect(screen.getByPlaceholderText('Tipo de producto')).toHaveValue('Agroquimico')
    expect(screen.getByRole('combobox')).toHaveValue('litros')
  })

})