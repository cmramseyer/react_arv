import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/ordenesFumigacionService', () => ({
  getOrdenFumigacion: vi.fn(),
  updateOrdenFumigacion: vi.fn(),
}))

vi.mock('../services/productosService', () => ({
  getProductos: vi.fn(),
}))

vi.mock('../services/estanciasService', () => ({
  getEstancias: vi.fn(),
}))

vi.mock('../services/lotesService', () => ({
  getLotesPorEstancia: vi.fn(),
}))

vi.mock('../services/cultivosService', () => ({
  getCultivos: vi.fn(),
}))

vi.mock('../services/maquinistasService', () => ({
  getMaquinistas: vi.fn(),
}))

import { getOrdenFumigacion, updateOrdenFumigacion } from '../services/ordenesFumigacionService'
import { getProductos } from '../services/productosService'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getCultivos } from '../services/cultivosService'
import { getMaquinistas } from '../services/maquinistasService'
import OrdenFumigacionEditar from './OrdenFumigacionEditar'

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
    render(
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
