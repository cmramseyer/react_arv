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

import LoteNuevo from './LoteNuevo'

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

    expect(screen.getByPlaceholderText('Nombre del lote')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Lat')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Long')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Link mapa')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Hectareas')).toBeInTheDocument()
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

    await user.type(screen.getByPlaceholderText('Nombre del lote'), 'Lote Tres')
    await user.type(screen.getByPlaceholderText('Lat'), '50')
    await user.type(screen.getByPlaceholderText('Long'), '60')
    await user.type(screen.getByPlaceholderText('Link mapa'), 'http://mapa3.com')
    await user.type(screen.getByPlaceholderText('Hectareas'), '15')
    await user.selectOptions(
      screen.getByRole('combobox'),
      '1'
    )

    const botonCrear = screen.getByRole('button', { name: /crear/i })

    await user.click(botonCrear)

    await waitFor(() => {
      expect(createLote).toHaveBeenCalledTimes(1)
    })

    const [fd] = createLote.mock.lastCall

    expect(fd).toBeInstanceOf(FormData)

    expect(fd.get('lote[nombre]')).toBe('Lote Tres')
    expect(fd.get('lote[lat]')).toBe('50')
    expect(fd.get('lote[long]')).toBe('60')
    expect(fd.get('lote[link_mapa]')).toBe('http://mapa3.com')
    expect(fd.get('lote[hectareas]')).toBe('15')

    expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
  })

  it('show errors if form is not complete', async () => {
    render(
      <MemoryRouter>
        <LoteNuevo />
      </MemoryRouter>
    )
      
    const botonCrear = screen.getByRole('button', { name: /crear/i })
    fireEvent.click(botonCrear)
  
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('Las hectáreas son obligatorias')).toBeInTheDocument()
  
    // Ahora completamos nombre pero dejamos hectareas en cero para probar otra validación
    await userEvent.type(screen.getByPlaceholderText('Nombre del lote'), 'Lote Test')
    await userEvent.type(screen.getByPlaceholderText('Hectareas'), '0')
  
    user.click(botonCrear)
  
    expect(await screen.findByText('Debe ser mayor a 0')).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('Nombre del lote'), 'Lote Test')
    await userEvent.type(screen.getByPlaceholderText('Hectareas'), '10001')
  
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
})
  
