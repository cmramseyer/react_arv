import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mockear los servicios
vi.mock('../services/lotesService', () => ({
  getLotes: vi.fn(),
  deleteLote: vi.fn(),
}))

import { getLotes, deleteLote } from '../services/lotesService'
import Lotes from './Lotes'

const lotesResponse = [
  { id: 1, nombre_estancia: 'Estancia Uno', nombre: 'Lote Uno', hectareas: 5 },
  { id: 2, nombre_estancia: 'Estancia Dos', nombre: 'Lote Dos', hectareas: 10 },
]

const lotesAfterDelete = [
  { id: 2, nombre_estancia: 'Estancia Dos', nombre: 'Lote Dos', hectareas: 10 },
]

describe('Lotes list', () => {
  beforeEach(() => {
    getLotes.mockClear()
    deleteLote.mockClear()
    mockNavigate.mockClear()
  })

  it('fetches lotes and shows them in the table', async () => {
    getLotes.mockResolvedValueOnce(lotesResponse)

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getLotes).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText('Lote Uno')).toBeInTheDocument()
    expect(await screen.findByText('Estancia Uno')).toBeInTheDocument()
    expect(await screen.findByText('Lote Dos')).toBeInTheDocument()
  })

  it('navigates to nuevo lote', async () => {
    getLotes.mockResolvedValueOnce(lotesResponse)

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await screen.findByText('Lote Uno')

    await user.click(screen.getByRole('button', { name: /nuevo lote/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/lotes/nuevo')
  })

  it('navigates to detalle and edit from the list', async () => {
    getLotes.mockResolvedValueOnce(lotesResponse)

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await screen.findByText('Lote Uno')

    await user.click(screen.getAllByRole('button', { name: /ver/i })[0])
    expect(mockNavigate).toHaveBeenCalledWith('/lotes/1')

    await user.click(screen.getAllByRole('button', { name: /editar/i })[0])
    expect(mockNavigate).toHaveBeenCalledWith('/lotes/1/editar')
  })

  it('deletes a lote and refreshes the list', async () => {
    getLotes
      .mockResolvedValueOnce(lotesResponse)
      .mockResolvedValueOnce(lotesAfterDelete)
    deleteLote.mockResolvedValueOnce()

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await screen.findByText('Lote Uno')

    await user.click(screen.getAllByRole('button', { name: /eliminar/i })[0])

    await waitFor(() => expect(deleteLote).toHaveBeenCalledWith(1))
    await waitFor(() => expect(getLotes).toHaveBeenCalledTimes(2))
  })
})
