import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/ordenesFumigacionService', () => ({
  getOrdenFumigacion: vi.fn(),
  terminarOrdenFumigacion: vi.fn(),
}))

vi.mock('../services/estanciasService', () => ({
  getEstancias: vi.fn(),
}))

vi.mock('../services/lotesService', () => ({
  getLotesPorEstancia: vi.fn(),
}))

vi.mock('../services/productosService', () => ({
  getProductos: vi.fn(),
}))

vi.mock('../services/maquinistasService', () => ({
  getMaquinistas: vi.fn(),
}))

import { getOrdenFumigacion, terminarOrdenFumigacion } from '../services/ordenesFumigacionService'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'
import { getMaquinistas } from '../services/maquinistasService'
import OrdenFumigacionTerminar from './OrdenFumigacionTerminar'

const ordenFixture = {
  id: 1,
  estancia_id: 1,
  lote_id: 2,
  creator: 'Tester',
  estado_orden: 'pendiente',
  lotes: [],
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('OrdenFumigacionTerminar', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getOrdenFumigacion.mockResolvedValueOnce(ordenFixture)
    getEstancias.mockResolvedValueOnce([{ id: 1, nombre: 'Estancia Uno' }])
    getLotesPorEstancia.mockResolvedValueOnce([{ id: 2, nombre: 'Lote Uno', hectareas: 5 }])
    getProductos.mockResolvedValueOnce([])
    getMaquinistas.mockResolvedValueOnce([])
  })

  it('returns to Ordenes without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/ordenes_fumigacion', '/ordenes_fumigacion/1/terminar']} initialIndex={1}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<div>Ordenes Page</div>} />
          <Route path="/ordenes_fumigacion/:id/terminar" element={<OrdenFumigacionTerminar />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await screen.findByText('Terminar Orden de Fumigación')

    const getOrdenCalls = getOrdenFumigacion.mock.calls.length
    const getEstanciasCalls = getEstancias.mock.calls.length
    const getLotesCalls = getLotesPorEstancia.mock.calls.length
    const getProductosCalls = getProductos.mock.calls.length
    const getMaquinistasCalls = getMaquinistas.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    expect(terminarOrdenFumigacion).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(getOrdenFumigacion).toHaveBeenCalledTimes(getOrdenCalls)
      expect(getEstancias).toHaveBeenCalledTimes(getEstanciasCalls)
      expect(getLotesPorEstancia).toHaveBeenCalledTimes(getLotesCalls)
      expect(getProductos).toHaveBeenCalledTimes(getProductosCalls)
      expect(getMaquinistas).toHaveBeenCalledTimes(getMaquinistasCalls)
    })
  })
})
