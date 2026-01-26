import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/ordenesFumigacionService', () => ({
  getOrdenFumigacion: vi.fn(),
  deleteOrdenFumigacion: vi.fn(),
  imprimirOrdenFumigacion: vi.fn(),
  getAdjuntosOrden: vi.fn(),
}))

import {
  getOrdenFumigacion,
  deleteOrdenFumigacion,
  imprimirOrdenFumigacion,
  getAdjuntosOrden,
} from '../services/ordenesFumigacionService'
import OrdenFumigacionShow from './OrdenFumigacionShow'

const ordenFixture = {
  id: 1,
  nombre_estancia: 'Estancia Uno',
  nombre_lote: 'Lote Uno',
  estado_orden: 'pendiente',
  hectareas: 10,
  created_at_locale: '01/01/2025',
  creator: 'Tester',
  sensible: false,
  comentarios: '',
  cultivo: { nombre: 'Trigo' },
  lotes: [],
  facturas: [],
  maquinista: { nombre: 'Pedro' },
  fecha_trabajo_ddmmyyyy: '01/01/2025',
  datos_clima: '',
  info_trabajo: '',
  orden_url: null,
  orden_pdf_fecha_creacion: null,
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('OrdenFumigacionShow', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getOrdenFumigacion.mockResolvedValueOnce(ordenFixture)
  })

  it('returns to Ordenes without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/ordenes_fumigacion', '/ordenes_fumigacion/1']} initialIndex={1}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<div>Ordenes Page</div>} />
          <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    const ordenLabels = await screen.findAllByText('Orden #1')
    expect(ordenLabels.length).toBeGreaterThan(0)

    const getOrdenCalls = getOrdenFumigacion.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    expect(deleteOrdenFumigacion).not.toHaveBeenCalled()
    expect(imprimirOrdenFumigacion).not.toHaveBeenCalled()
    expect(getAdjuntosOrden).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(getOrdenFumigacion).toHaveBeenCalledTimes(getOrdenCalls)
    })
  })
})
