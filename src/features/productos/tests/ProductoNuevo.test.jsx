import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mockear los servicios
vi.mock('@/features/productos/api/productosService', () => ({
  createProducto: vi.fn(() => Promise.resolve()),
}))

import { createProducto } from '@/features/productos/api/productosService'

import ProductoNuevo from '@/features/productos/pages/ProductoNew'

function ProductosMock() {
  return <h1>Productos</h1>
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

let user

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })

const renderWithQueryClient = (ui, queryClient = createQueryClient()) => {
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  }
}

describe('Nuevo Producto', () => {
  beforeEach(() => {
    user = userEvent.setup()
    createProducto.mockClear()
  })

  it('creates a new Producto', async () => {

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/productos/new']}>
        <Routes>
          <Route path="/productos/new" element={<ProductoNuevo />} />
          <Route path="/productos" element={<ProductosMock />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Kilogramos' }))
    await user.type(screen.getByLabelText('Nombre'), 'Roundup')
    await user.type(screen.getByLabelText('Tipo de producto'), 'Agroquimico')

    const botonCrear = screen.getByRole('button', { name: /guardar/i })

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

    renderWithQueryClient(
      <MemoryRouter>
        <ProductoNuevo />
      </MemoryRouter>
    )

    const botonCrear = screen.getByRole('button', { name: /guardar/i })
    await user.click(botonCrear)
  
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('El tipo de producto es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('La unidad de medida es obligatoria')).toBeInTheDocument()
  })

  it('does not create a product on initial render', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/productos', '/productos/new']} initialIndex={1}>
        <Routes>
          <Route path="/productos" element={<ProductosMock />} />
          <Route path="/productos/new" element={<ProductoNuevo />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    expect(screen.getByTestId('location')).toHaveTextContent('/productos/new')
    expect(createProducto).not.toHaveBeenCalled()
  })

})
