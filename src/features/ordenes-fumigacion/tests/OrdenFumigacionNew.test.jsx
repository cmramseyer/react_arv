import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/features/estancias/api/estanciasService', () => ({
  getEstancias: vi.fn(),
}))

vi.mock('@/features/lotes/api/lotesService', () => ({
  getLote: vi.fn(),
  getLotes: vi.fn(),
  getLotesPorEstancia: vi.fn(),
  createLote: vi.fn(),
  updateLote: vi.fn(),
  deleteLote: vi.fn(),
}))

vi.mock('@/features/productos/api/productosService', () => ({
  getProductos: vi.fn(),
  createProducto: vi.fn(),
  getProducto: vi.fn(),
  updateProducto: vi.fn(),
  deleteProducto: vi.fn(),
}))

vi.mock('@/features/cultivos/api/cultivosService', () => ({
  getCultivos: vi.fn(),
  getCultivo: vi.fn(),
  createCultivo: vi.fn(),
  updateCultivo: vi.fn(),
  deleteCultivo: vi.fn(),
}))

vi.mock('@/features/ordenes-fumigacion/api/ordenesFumigacionService', () => ({
  getOrdenFumigacion: vi.fn(),
  getOrdenesFumigacion: vi.fn(),
  createOrdenFumigacion: vi.fn(),
  updateOrdenFumigacion: vi.fn(),
  deleteOrdenFumigacion: vi.fn(),
}))

import { getEstancias } from '@/features/estancias/api/estanciasService'
import { getLotesPorEstancia } from '@/features/lotes/api/lotesService'
import { createProducto, getProductos } from '@/features/productos/api/productosService'
import { getCultivos } from '@/features/cultivos/api/cultivosService'
import { createOrdenFumigacion } from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'
import OrdenesFumigacionNueva from '@/features/ordenes-fumigacion/pages/OrdenFumigacionNew'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

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

describe('OrdenesFumigacionNueva', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getEstancias.mockResolvedValueOnce([])
    getProductos.mockResolvedValue([])
    createProducto.mockResolvedValue()
    getCultivos.mockResolvedValueOnce([])
    getLotesPorEstancia.mockResolvedValue([])
  })

  it('returns to Ordenes without extra requests when clicking Volver', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion', '/ordenes_fumigacion/nueva']} initialIndex={1}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<div>Ordenes Page</div>} />
          <Route path="/ordenes_fumigacion/nueva" element={<OrdenesFumigacionNueva />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getEstancias).toHaveBeenCalled()
      expect(getProductos).toHaveBeenCalled()
      expect(getCultivos).toHaveBeenCalled()
    })

    const getEstanciasCalls = getEstancias.mock.calls.length
    const getProductosCalls = getProductos.mock.calls.length
    const getCultivosCalls = getCultivos.mock.calls.length
    const getLotesCalls = getLotesPorEstancia.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    expect(createOrdenFumigacion).not.toHaveBeenCalled()
    expect(getEstancias).toHaveBeenCalledTimes(getEstanciasCalls)
    expect(getProductos).toHaveBeenCalledTimes(getProductosCalls)
    expect(getCultivos).toHaveBeenCalledTimes(getCultivosCalls)
    expect(getLotesPorEstancia).toHaveBeenCalledTimes(getLotesCalls)
  })

  it('allows creating a product from modal and refreshes product options', async () => {
    getProductos
      .mockResolvedValueOnce([
        { id: 1, nombre: '2,4D', unidad_medida: 'litros' },
      ])
      .mockResolvedValueOnce([
        { id: 1, nombre: '2,4D', unidad_medida: 'litros' },
        { id: 2, nombre: 'Roundup', unidad_medida: 'kg' },
      ])

    renderWithQueryClient(
      <MemoryRouter>
        <OrdenesFumigacionNueva />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getProductos).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole('button', { name: /nuevo producto/i }))

    const dialog = await screen.findByRole('dialog')

    await user.type(within(dialog).getByLabelText('Nombre'), 'Roundup')
    await user.type(within(dialog).getByLabelText('Tipo de producto'), 'Agroquimico')

    await user.click(within(dialog).getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Kilogramos' }))

    await user.click(within(dialog).getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(createProducto).toHaveBeenCalledTimes(1)
    })

    expect(createProducto).toHaveBeenCalledWith({
      nombre: 'Roundup',
      tipo_producto: 'Agroquimico',
      unidad_medida: 'kg',
    })

    await waitFor(() => {
      expect(getProductos).toHaveBeenCalledTimes(2)
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('Producto'))
    expect(await screen.findByRole('option', { name: 'Roundup' })).toBeInTheDocument()
  })

  it('filters product options by search text in product select', async () => {
    getProductos.mockResolvedValueOnce([
      { id: 1, nombre: 'Producto Base', unidad_medida: 'litros' },
      { id: 2, nombre: 'Coadyuvante', unidad_medida: 'kg' },
      { id: 3, nombre: 'Super Prod Mix', unidad_medida: 'ml' },
    ])

    renderWithQueryClient(
      <MemoryRouter>
        <OrdenesFumigacionNueva />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getProductos).toHaveBeenCalledTimes(1)
    })

    const productSearchInput = screen.getByLabelText('Producto')
    await user.click(productSearchInput)
    await user.type(productSearchInput, 'prod')

    expect(await screen.findByRole('option', { name: 'Producto Base' })).toBeInTheDocument()
    expect(await screen.findByRole('option', { name: 'Super Prod Mix' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Coadyuvante' })).not.toBeInTheDocument()
  })
})
