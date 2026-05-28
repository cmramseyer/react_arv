import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

// Mockear los servicios
vi.mock('../services/lotesService', () => ({
  getLotes: vi.fn(() => Promise.resolve([])),
  createLote: vi.fn(() => Promise.resolve()),
  updateLote: vi.fn(() => Promise.resolve()),
  deleteLote: vi.fn(() => Promise.resolve())
}))

vi.mock('../services/estanciasService', () => ({
  getEstancias: vi.fn(() => Promise.resolve([]))
}))

import { getLotes, createLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'

import LoteNuevo from './LoteNew'

const mockLotes = () => {
  getLotes.mockResolvedValueOnce([
    { id: 1, nombre: 'Lote Uno', lat: 10, long: 20, link_mapa: 'http://mapa1.com', hectareas: 5, estancia_id: 1 },
    { id: 2, nombre: 'Lote Dos', lat: 30, long: 40, link_mapa: 'http://mapa2.com', hectareas: 10, estancia_id: 2 }
  ])
  getLotes.mockResolvedValueOnce([
    { id: 1, nombre: 'Lote Uno', lat: 10, long: 20, link_mapa: 'http://mapa1.com', hectareas: 5, estancia_id: 1 },
    { id: 2, nombre: 'Lote Dos', lat: 30, long: 40, link_mapa: 'http://mapa2.com', hectareas: 10, estancia_id: 2 },
    { id: 3, nombre: 'Lote Tres', lat: 50, long: 60, link_mapa: 'http://mapa3.com', hectareas: 15, estancia_id: 1 }
  ])
}

const mockEstancias = () => {
  getEstancias.mockResolvedValueOnce([
    { id: 1, nombre: 'Estancia Uno' },
    { id: 2, nombre: 'Estancia Dos' }
  ])
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

let user

describe('Lotes Form', () => {
  beforeEach(() => {
    user = userEvent.setup()
    getLotes.mockClear()
    createLote.mockClear()
    getEstancias.mockClear()
    mockEstancias()
  })

  it('renders the form', async () => {
    render(
      <MemoryRouter>
        <LoteNuevo />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getEstancias).toHaveBeenCalled()
    })

    expect(screen.getByLabelText('Nombre del lote')).toBeInTheDocument()
    expect(screen.getByLabelText('Latitud')).toBeInTheDocument()
    expect(screen.getByLabelText('Longitud')).toBeInTheDocument()
    expect(screen.getByLabelText('Link mapa')).toBeInTheDocument()
    expect(screen.getByLabelText('Hectareas')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
  })

  it('creates a new Lote', async () => {

    mockLotes()

    render(
      <MemoryRouter initialEntries={['/lotes/nuevo']}>
        <Routes>
          <Route path="/lotes" element={<div>Lotes Page</div>} />
          <Route path="/lotes/nuevo" element={<LoteNuevo />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre del lote'), 'Lote Tres')
    await user.type(screen.getByLabelText('Latitud'), '50')
    await user.type(screen.getByLabelText('Longitud'), '60')
    await user.type(screen.getByLabelText('Link mapa'), 'http://mapa3.com')
    await user.type(screen.getByLabelText('Hectareas'), '15')

    const botonCrear = screen.getByRole('button', { name: /crear/i })
    fireEvent.click(botonCrear)

    expect(await screen.findByText('La estancia es obligatoria')).toBeInTheDocument()
  
    // Ahora completamos nombre y select pero dejamos hectareas en cero para probar otra validación
     await user.click(screen.getByRole('combobox'))
     await user.click(screen.getByRole('option', { name: 'Estancia Uno' }))
     await userEvent.clear(screen.getByLabelText('Nombre del lote'))
     await userEvent.type(screen.getByLabelText('Nombre del lote'), 'Lote Test')
     await userEvent.clear(screen.getByLabelText('Hectareas'))
     await userEvent.type(screen.getByLabelText('Hectareas'), '0')

    user.click(botonCrear)

    expect(await screen.findByText('Debe ser mayor a 0')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Hectareas'), '10001')

    user.click(botonCrear)

    expect(await screen.findByText('Debe ser menor a 10000')).toBeInTheDocument()
  })

  it('completes the multiselect form Estancia', async () => {

    render(
      <MemoryRouter>
        <LoteNuevo />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getEstancias).toHaveBeenCalled()
    })

    expect(await screen.findByText('Estancia Uno')).toBeInTheDocument()
    expect(await screen.findByText('Estancia Dos')).toBeInTheDocument()
  })

  it('returns to Lotes without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/lotes', '/lotes/nuevo']} initialIndex={1}>
        <Routes>
          <Route path="/lotes" element={<div>Lotes Page</div>} />
          <Route path="/lotes/nuevo" element={<LoteNuevo />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getEstancias).toHaveBeenCalled()
    })

    const getEstanciasCalls = getEstancias.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
    expect(createLote).not.toHaveBeenCalled()
    expect(getEstancias).toHaveBeenCalledTimes(getEstanciasCalls)
  })
})
  
