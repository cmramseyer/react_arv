import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/features/ordenes-fumigacion/api/ordenesFumigacionService', () => ({
  getOrdenFumigacion: vi.fn(),
  getOrdenesFumigacion: vi.fn(),
  createOrdenFumigacion: vi.fn(),
  updateOrdenFumigacion: vi.fn(),
  deleteOrdenFumigacion: vi.fn(),
}))

vi.mock('@/features/productos/api/productosService', () => ({
  getProductos: vi.fn(),
  getProducto: vi.fn(),
  createProducto: vi.fn(),
  updateProducto: vi.fn(),
  deleteProducto: vi.fn(),
}))

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

vi.mock('@/features/cultivos/api/cultivosService', () => ({
  getCultivos: vi.fn(),
  getCultivo: vi.fn(),
  createCultivo: vi.fn(),
  updateCultivo: vi.fn(),
  deleteCultivo: vi.fn(),
}))

vi.mock('@/features/maquinistas/api/maquinistasService', () => ({
  getMaquinistas: vi.fn(),
  getMaquinista: vi.fn(),
  createMaquinista: vi.fn(),
  updateMaquinista: vi.fn(),
  deleteMaquinista: vi.fn(),
}))

import { getOrdenFumigacion, updateOrdenFumigacion } from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'
import { getProductos } from '@/features/productos/api/productosService'
import { getEstancias } from '@/features/estancias/api/estanciasService'
import { getLotesPorEstancia } from '@/features/lotes/api/lotesService'
import { getCultivos } from '@/features/cultivos/api/cultivosService'
import { getMaquinistas } from '@/features/maquinistas/api/maquinistasService'
import OrdenFumigacionEditar from '@/features/ordenes-fumigacion/pages/OrdenFumigacionEdit'

const ordenFixture = {
  id: 1,
  estado_orden: 'pendiente',
  estancia_id: 1,
  cultivo: { id: 2, nombre: 'Trigo' },
  lotes: [],
  creator: 'Tester',
  datos_clima: '',
  info_trabajo: '',
  fecha_trabajo: '',
  maquinista: { id: 3, nombre: 'Pedro' },
  sensible: false,
  comentarios: '',
}

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

describe('OrdenFumigacionEditar', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getOrdenFumigacion.mockResolvedValueOnce(ordenFixture)
    getEstancias.mockResolvedValueOnce([])
    getProductos.mockResolvedValueOnce([])
    getCultivos.mockResolvedValueOnce([])
    getMaquinistas.mockResolvedValueOnce([])
    getLotesPorEstancia.mockResolvedValue([])
  })

  it('returns to Ordenes without extra requests when clicking Volver', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion', '/ordenes_fumigacion/1/editar']} initialIndex={1}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<div>Ordenes Page</div>} />
          <Route path="/ordenes_fumigacion/:id/editar" element={<OrdenFumigacionEditar />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getOrdenFumigacion).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(getLotesPorEstancia).toHaveBeenCalled()
    })

    const getOrdenCalls = getOrdenFumigacion.mock.calls.length
    const getEstanciasCalls = getEstancias.mock.calls.length
    const getProductosCalls = getProductos.mock.calls.length
    const getCultivosCalls = getCultivos.mock.calls.length
    const getMaquinistasCalls = getMaquinistas.mock.calls.length
    const getLotesCalls = getLotesPorEstancia.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    expect(updateOrdenFumigacion).not.toHaveBeenCalled()
    expect(getOrdenFumigacion).toHaveBeenCalledTimes(getOrdenCalls)
    expect(getEstancias).toHaveBeenCalledTimes(getEstanciasCalls)
    expect(getProductos).toHaveBeenCalledTimes(getProductosCalls)
    expect(getCultivos).toHaveBeenCalledTimes(getCultivosCalls)
    expect(getMaquinistas).toHaveBeenCalledTimes(getMaquinistasCalls)
    expect(getLotesPorEstancia).toHaveBeenCalledTimes(getLotesCalls)
  })
})
