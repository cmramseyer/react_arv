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
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  // Mimics real Sonner: with a loading message, toast.promise returns a
  // non-rejecting wrapper instead of the original promise, so awaiting it
  // never throws. Control flow must await the mutation promise itself.
  toast: {
    promise: vi.fn((promise) => {
      promise.catch(() => {})
      return { unwrap: () => promise }
    }),
  },
}))

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

  const agregarLoteManual = async () => {
    const selects = await screen.findAllByRole('combobox')
    await user.click(selects[0])
    await user.click(await screen.findByRole('option', { name: 'Estancia Uno' }))
    await user.click(screen.getByRole('button', { name: 'Agregar lote manual' }))
  }

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
    getEstancias.mockReset()
    getEstancias.mockResolvedValue([{ id: 1, nombre: 'Estancia Uno' }])
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

    await agregarLoteManual()
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

    await user.click(screen.getByRole('button', { name: 'Agregar dosis' }))
    await user.click(screen.getByLabelText('Producto'))
    expect(await screen.findByRole('option', { name: 'Roundup' })).toBeInTheDocument()
  })

  it('filters product options by search text in product select', async () => {
    getEstancias.mockReset()
    getEstancias.mockResolvedValue([{ id: 1, nombre: 'Estancia Uno' }])
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

    await agregarLoteManual()
    await user.click(screen.getByRole('button', { name: 'Agregar dosis' }))
    const productSearchInput = screen.getByLabelText('Producto')
    await user.click(productSearchInput)
    await user.type(productSearchInput, 'prod')

    expect(await screen.findByRole('option', { name: 'Producto Base' })).toBeInTheDocument()
    expect(await screen.findByRole('option', { name: 'Super Prod Mix' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Coadyuvante' })).not.toBeInTheDocument()
  })

  it('creates an order with toast feedback and navigates', async () => {
    getEstancias.mockReset()
    getEstancias.mockResolvedValue([{ id: 1, nombre: 'Estancia Uno' }])
    createOrdenFumigacion.mockResolvedValue({ id: '3' })

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion/nueva']}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<div>Ordenes Page</div>} />
          <Route path="/ordenes_fumigacion/nueva" element={<OrdenesFumigacionNueva />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await agregarLoteManual()
    await user.type(screen.getByPlaceholderText('Ej. Sector detrás del galpón'), 'Sector Norte')
    await user.type(screen.getByLabelText('Hectareas'), '10')
    await user.click(screen.getByRole('button', { name: /^crear$/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    })
    expect(createOrdenFumigacion).toHaveBeenCalledTimes(1)
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Guardando orden de fumigación...',
        success: 'Orden de fumigación creada',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the new page and keeps form values when creation fails', async () => {
    getEstancias.mockReset()
    getEstancias.mockResolvedValue([{ id: 1, nombre: 'Estancia Uno' }])
    createOrdenFumigacion.mockRejectedValueOnce(new Error('Error creating'))

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion/nueva']}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<div>Ordenes Page</div>} />
          <Route path="/ordenes_fumigacion/nueva" element={<OrdenesFumigacionNueva />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await agregarLoteManual()
    await user.type(screen.getByPlaceholderText('Ej. Sector detrás del galpón'), 'Sector Norte')
    await user.type(screen.getByLabelText('Hectareas'), '10')
    await user.click(screen.getByRole('button', { name: /^crear$/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion/nueva')
    expect(screen.getByDisplayValue('Sector Norte')).toBeInTheDocument()
  })
})
