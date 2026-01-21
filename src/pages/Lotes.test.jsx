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
  getLotesPorEstancia: vi.fn(),
  deleteLote: vi.fn(),
}))

vi.mock('../services/estanciasService', () => ({
  getEstancias: vi.fn(),
}))

import { getLotes, getLotesPorEstancia, deleteLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'
import Lotes from './Lotes'

const lotesResponse = [
  { id: 1, nombre_estancia: 'Estancia Uno', nombre: 'Lote Uno', hectareas: 5 },
  { id: 2, nombre_estancia: 'Estancia Dos', nombre: 'Lote Dos', hectareas: 10 },
]

const lotesAfterDelete = [
  { id: 2, nombre_estancia: 'Estancia Dos', nombre: 'Lote Dos', hectareas: 10 },
]

const estanciasResponse = [
  { id: 1, nombre: 'Estancia Uno' },
  { id: 2, nombre: 'Estancia Dos' },
]

const lotesEstanciaUno = [
  { id: 1, nombre_estancia: 'Estancia Uno', nombre: 'Lote Uno', hectareas: 5 },
]

describe('Lotes list', () => {
  beforeAll(() => {
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = () => false
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = () => {}
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = () => {}
    }
  })

  beforeEach(() => {
    getLotes.mockClear()
    getLotesPorEstancia.mockClear()
    getEstancias.mockClear()
    deleteLote.mockClear()
    mockNavigate.mockClear()
  })

  it('fetches lotes and shows them in the table', async () => {
    getEstancias.mockResolvedValueOnce(estanciasResponse)
    getLotes.mockResolvedValue(lotesResponse)

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getLotes).toHaveBeenCalledTimes(2)
    })

    expect(await screen.findByText('Lote Uno')).toBeInTheDocument()
    expect((await screen.findAllByText('Estancia Uno')).length).toBeGreaterThan(0)
    expect(await screen.findByText('Lote Dos')).toBeInTheDocument()
  })

  it('navigates to nuevo lote', async () => {
    getEstancias.mockResolvedValueOnce(estanciasResponse)
    getLotes.mockResolvedValue(lotesResponse)

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await screen.findByText('Lote Uno')

    await user.click(screen.getByRole('button', { name: /crear lote/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/lotes/nuevo')
  })

  it('navigates to detalle and edit from the list', async () => {
    getEstancias.mockResolvedValueOnce(estanciasResponse)
    getLotes.mockResolvedValue(lotesResponse)

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
    getEstancias.mockResolvedValueOnce(estanciasResponse)
    getLotes
      .mockResolvedValueOnce(lotesResponse)
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
    await waitFor(() => expect(getLotes).toHaveBeenCalledTimes(3))
  })

  it('loads estancias and shows them in the filter dropdown', async () => {
    getEstancias.mockResolvedValueOnce(estanciasResponse)
    getLotes.mockResolvedValue(lotesResponse)

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await waitFor(() => expect(getEstancias).toHaveBeenCalledTimes(1))

    expect(await screen.findByText('Todas las estancias')).toBeInTheDocument()
    expect(getEstancias).toHaveBeenCalledTimes(1)
  })

  it('filters lotes when selecting an estancia', async () => {
    getEstancias.mockResolvedValueOnce(estanciasResponse)
    getLotes.mockResolvedValue(lotesResponse)
    getLotesPorEstancia.mockResolvedValueOnce(lotesEstanciaUno)

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await screen.findByText('Lote Uno')

    await waitFor(() => {
      expect(getLotes).toHaveBeenCalledTimes(2)
    })

    expect(getLotesPorEstancia).not.toHaveBeenCalled()
    expect(await screen.findByText('Todas las estancias')).toBeInTheDocument()
  })

  it('resets the filter when clicking the clear button', async () => {
    getEstancias.mockResolvedValueOnce(estanciasResponse)
    getLotes.mockResolvedValue(lotesResponse)
    getLotesPorEstancia.mockResolvedValueOnce(lotesEstanciaUno)

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await screen.findByText('Lote Uno')

    expect(screen.queryByRole('button', { name: /limpiar filtro/i })).not.toBeInTheDocument()
  })

  it('shows and hides the clear button based on filter state', async () => {
    getEstancias.mockResolvedValueOnce(estanciasResponse)
    getLotes.mockResolvedValue(lotesResponse)
    getLotesPorEstancia.mockResolvedValueOnce(lotesEstanciaUno)

    render(
      <MemoryRouter>
        <Lotes />
      </MemoryRouter>
    )

    await screen.findByText('Lote Uno')

    expect(screen.queryByRole('button', { name: /limpiar filtro/i })).not.toBeInTheDocument()
  })
})
