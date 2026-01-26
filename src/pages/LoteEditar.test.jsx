import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/lotesService', () => ({
  getLote: vi.fn(),
  updateLote: vi.fn(),
}))

vi.mock('../services/estanciasService', () => ({
  getEstancias: vi.fn(),
}))

import { getLote, updateLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'
import LoteEditar from './LoteEditar'

const loteFixture = {
  id: 1,
  nombre: 'Lote Uno',
  lat: 10,
  long: 20,
  link_mapa: 'http://mapa1.com',
  hectareas: 5,
  estancia_id: 1,
}

const estanciasFixture = [
  { id: 1, nombre: 'Estancia Uno' },
  { id: 2, nombre: 'Estancia Dos' },
]

const LocationDisplay = () => {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

const prepareMocks = (loteData = loteFixture, estanciasData = estanciasFixture) => {
  getLote.mockResolvedValueOnce(loteData)
  getEstancias.mockResolvedValueOnce(estanciasData)
}

describe('LoteEditar', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  it('renders the form with fetched data', async () => {
    prepareMocks()

    render(
      <MemoryRouter initialEntries={['/lotes/1/editar']}>
        <Routes>
          <Route path="/lotes" element={<div>Lotes Page</div>} />
          <Route path="/lotes/:id/editar" element={<LoteEditar />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(getLote).toHaveBeenCalledWith('1'))
    expect(getEstancias).toHaveBeenCalledTimes(1)

    expect(await screen.findByDisplayValue('Lote Uno')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /actualizar/i })).toBeInTheDocument()
  })

  it('submits the updated lote and navigates back', async () => {
    prepareMocks()

    render(
      <MemoryRouter initialEntries={['/lotes/1/editar']}>
        <Routes>
          <Route path="/lotes" element={<div>Lotes Page</div>} />
          <Route path="/lotes/:id/editar" element={<LoteEditar />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('Lote Uno')

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Estancia Uno' }))

    const nombre = screen.getByLabelText('Nombre del lote')
    await user.clear(nombre)
    await user.type(nombre, 'Lote Tres')

    const lat = screen.getByLabelText('Latitud')
    await user.clear(lat)
    await user.type(lat, '50')

    const long = screen.getByLabelText('Longitud')
    await user.clear(long)
    await user.type(long, '60')

    const linkMapa = screen.getByLabelText('Link mapa')
    await user.clear(linkMapa)
    await user.type(linkMapa, 'http://mapa3.com')

    const hectareas = screen.getByLabelText('Hectareas')
    await user.clear(hectareas)
    await user.type(hectareas, '15')

    const botonActualizar = screen.getByRole('button', { name: /actualizar/i })
    await user.click(botonActualizar)

    await waitFor(() => expect(updateLote).toHaveBeenCalledTimes(1))

    const [idArg, formData] = updateLote.mock.lastCall
    expect(idArg).toBe('1')
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('lote[nombre]')).toBe('Lote Tres')
    expect(formData.get('lote[lat]')).toBe('50')
    expect(formData.get('lote[long]')).toBe('60')
    expect(formData.get('lote[link_mapa]')).toBe('http://mapa3.com')
    expect(formData.get('lote[hectareas]')).toBe('15')

    expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
  })

  it('returns to Lotes without extra requests when clicking Volver', async () => {
    prepareMocks()

    render(
      <MemoryRouter initialEntries={['/lotes', '/lotes/1/editar']} initialIndex={1}>
        <Routes>
          <Route path="/lotes" element={<div>Lotes Page</div>} />
          <Route path="/lotes/:id/editar" element={<LoteEditar />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('Lote Uno')

    const getLoteCalls = getLote.mock.calls.length
    const getEstanciasCalls = getEstancias.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
    expect(updateLote).not.toHaveBeenCalled()
    expect(getLote).toHaveBeenCalledTimes(getLoteCalls)
    expect(getEstancias).toHaveBeenCalledTimes(getEstanciasCalls)
  })

  it('shows not found message when lote data is missing', async () => {
    getLote.mockResolvedValueOnce(null)
    getEstancias.mockResolvedValueOnce(estanciasFixture)

    render(
      <MemoryRouter initialEntries={['/lotes/1/editar']}>
        <Routes>
          <Route path="/lotes" element={<div>Lotes Page</div>} />
          <Route path="/lotes/:id/editar" element={<LoteEditar />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('No se encontró el lote')).toBeInTheDocument()
    expect(updateLote).not.toHaveBeenCalled()
  })
})
