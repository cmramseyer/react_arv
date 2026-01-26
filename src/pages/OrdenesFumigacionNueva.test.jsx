import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/estanciasService', () => ({
  getEstancias: vi.fn(),
}))

vi.mock('../services/lotesService', () => ({
  getLotesPorEstancia: vi.fn(),
}))

vi.mock('../services/productosService', () => ({
  getProductos: vi.fn(),
}))

vi.mock('../services/cultivosService', () => ({
  getCultivos: vi.fn(),
}))

vi.mock('../services/ordenesFumigacionService', () => ({
  createOrdenFumigacion: vi.fn(),
}))

import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'
import { getCultivos } from '../services/cultivosService'
import { createOrdenFumigacion } from '../services/ordenesFumigacionService'
import OrdenesFumigacionNueva from './OrdenesFumigacionNueva'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('OrdenesFumigacionNueva', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getEstancias.mockResolvedValueOnce([])
    getProductos.mockResolvedValueOnce([])
    getCultivos.mockResolvedValueOnce([])
    getLotesPorEstancia.mockResolvedValue([])
  })

  it('returns to Ordenes without extra requests when clicking Volver', async () => {
    render(
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
})
