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

import { getLotes, createLote } from '../services/lotesService'

import Lotes from './Lotes'

describe('Lotes Form', () => {
  beforeEach(() => {
    getLotes.mockClear()
    createLote.mockClear()
  })

  it('renderiza el formulario correctamente', () => {
    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
  })

  it('puede crear un nuevo lote', async () => {
    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Lote Test')
    await userEvent.type(screen.getByPlaceholderText('Lat'), '10')
    await userEvent.type(screen.getByPlaceholderText('Long'), '20')
    await userEvent.type(screen.getByPlaceholderText('Link mapa'), 'http://link.com')
    await userEvent.type(screen.getByPlaceholderText('Hectareas'), '5')
    await userEvent.type(screen.getByPlaceholderText('Estancia ID'), '1')

    const botonCrear = screen.getByRole('button', { name: /crear/i })
    fireEvent.click(botonCrear)

    await waitFor(() => {
      expect(createLote).toHaveBeenCalledTimes(1)
    })
  })
})
