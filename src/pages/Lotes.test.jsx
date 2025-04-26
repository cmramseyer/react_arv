import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mockear los servicios
jest.mock('../services/lotesService', () => ({
  getLotes: jest.fn(() => Promise.resolve([])),
  createLote: jest.fn(() => Promise.resolve()),
  updateLote: jest.fn(() => Promise.resolve()),
  deleteLote: jest.fn(() => Promise.resolve())
}))

jest.mock('../services/estanciasService', () => ({
  getEstancias: jest.fn(() => Promise.resolve([]))
}))

import { getLotes, createLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'

import Lotes from './Lotes'

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

describe('Lotes Form', () => {
  beforeEach(() => {
    getLotes.mockClear()
    createLote.mockClear()
    getEstancias.mockClear()
    mockEstancias()
  })

  it('renderiza el formulario correctamente', async () => {
    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getLotes).toHaveBeenCalled()
    })    

    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
  })

  it('puede crear un nuevo lote', async () => {

    mockLotes()

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Lote Tres')
    await userEvent.type(screen.getByPlaceholderText('Lat'), '50')
    await userEvent.type(screen.getByPlaceholderText('Long'), '60')
    await userEvent.type(screen.getByPlaceholderText('Link mapa'), 'http://mapa3.com')
    await userEvent.type(screen.getByPlaceholderText('Hectareas'), '15')
    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      '1'
    )

    const botonCrear = screen.getByRole('button', { name: /crear/i })

    await userEvent.click(botonCrear)

    await waitFor(() => {
      expect(createLote).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre')).toHaveValue('')
      expect(screen.getByPlaceholderText('Hectareas')).toHaveValue(null)
    })
    expect(await screen.findByText('Lote Tres')).toBeInTheDocument()

  })

  it('muestra errores si nombre y hectareas no se completan o son inválidas', async () => {
    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )
      
    const botonCrear = screen.getByRole('button', { name: /crear/i })
    fireEvent.click(botonCrear)
  
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('Las hectáreas son obligatorias')).toBeInTheDocument()
  
    // Ahora completamos nombre pero dejamos hectareas en cero para probar otra validación
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Lote Test')
    await userEvent.type(screen.getByPlaceholderText('Hectareas'), '0')
  
    fireEvent.click(botonCrear)
  
    expect(await screen.findByText('Debe ser mayor a 0')).toBeInTheDocument()

    // Ahora completamos nombre pero dejamos hectareas en cero para probar otra validación
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Lote Test')
    await userEvent.type(screen.getByPlaceholderText('Hectareas'), '10001')
  
    fireEvent.click(botonCrear)
  
    expect(await screen.findByText('Debe ser menor a 10000')).toBeInTheDocument()
  })

  it('muestra lotes, permite editar uno y llena el formulario', async () => {
    mockLotes()
  
    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )
  
    // Esperar que cargue el listado de lotes
    expect(await screen.findByText('Lote Uno')).toBeInTheDocument()
    expect(await screen.findByText('Lote Dos')).toBeInTheDocument()
  
    // Simulamos hacer click en el botón Editar del primer lote
    fireEvent.click(screen.getAllByText('Editar')[0])
  
    // Verificamos que el formulario se llene con los datos correctos
    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Lote Uno')
    expect(screen.getByPlaceholderText('Lat')).toHaveValue(10)
    expect(screen.getByPlaceholderText('Long')).toHaveValue(20)
    expect(screen.getByPlaceholderText('Link mapa')).toHaveValue('http://mapa1.com')
    expect(screen.getByPlaceholderText('Hectareas')).toHaveValue(5)
    expect(screen.getByRole('combobox')).toHaveValue('1')
  })

  it('muestra estancias en el select del formulario', async () => {

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getEstancias).toHaveBeenCalled()
    })

    expect(await screen.findByText('Estancia Uno')).toBeInTheDocument()
    expect(await screen.findByText('Estancia Dos')).toBeInTheDocument()
  })
})
  
