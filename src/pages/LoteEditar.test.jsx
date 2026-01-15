import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

// Mockear los servicios
jest.mock('../services/lotesService', () => ({
  getLotes: jest.fn(() => Promise.resolve([])),
  getLote: jest.fn(() => Promise.resolve({})),
  createLote: jest.fn(() => Promise.resolve()),
  updateLote: jest.fn(() => Promise.resolve()),
  deleteLote: jest.fn(() => Promise.resolve())
}))

jest.mock('../services/estanciasService', () => ({
  getEstancias: jest.fn(() => Promise.resolve([]))
}))

import { getLotes, createLote, updateLote, getLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'

import LoteEditar from './LoteEditar'

const mockLotes = () => {
  getLote.mockResolvedValueOnce(
    { id: 1, nombre: 'Lote Uno', lat: 10, long: 20, link_mapa: 'http://mapa1.com', hectareas: 5, estancia_id: 1 }
  )
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
    getLote.mockClear()
    createLote.mockClear()
    updateLote.mockClear()
    getEstancias.mockClear()
    mockEstancias()
    mockLotes()
  })

  it('renders the form', async () => {
    render(
      <MemoryRouter initialEntries={['/lotes/1/editar']}>
        <Routes>
          <Route path="/lotes/:id/editar" element={<LoteEditar />} />
        </Routes>
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(getLote).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Propietario')).toHaveValue('Lote Uno')
    })


    expect(await screen.findByDisplayValue('Lote Uno')).toBeInTheDocument()


    expect(await screen.findByText('Actualizar')).toBeInTheDocument()
  })


  it('updates an existing Lote', async () => {
  
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

      const nombre = await screen.findByPlaceholderText('Propietario')
      await user.clear(nombre)
      await user.type(nombre, 'Lote Tres')

      const lat = await screen.findByPlaceholderText('Lat')
      await user.clear(lat)
      await user.type(lat, '50')

      const long = await screen.findByPlaceholderText('Long')
      await user.clear(long)
      await user.type(long, '60')

      const link_mapa = await screen.findByPlaceholderText('Link mapa')
      await user.clear(link_mapa)
      await user.type(link_mapa, 'http://mapa3.com')

      const hectareas = await screen.findByPlaceholderText('Hectareas')
      await user.clear(hectareas)
      await user.type(hectareas, '15')

      await user.selectOptions(
        screen.getByRole('combobox'),
        '1'
      )

      const botonActualizar = screen.getByRole('button', { name: /actualizar/i })

      await user.click(botonActualizar)
  
      await waitFor(() => {
        expect(updateLote).toHaveBeenCalledTimes(1)
      })
  
      const [id, fd] = updateLote.mock.lastCall
  
      expect(fd).toBeInstanceOf(FormData)
  
      expect(fd.get('lote[nombre]')).toBe('Lote Tres')
      expect(fd.get('lote[lat]')).toBe('50')
      expect(fd.get('lote[long]')).toBe('60')
      expect(fd.get('lote[link_mapa]')).toBe('http://mapa3.com')
      expect(fd.get('lote[hectareas]')).toBe('15')
  
      expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
    })

})
