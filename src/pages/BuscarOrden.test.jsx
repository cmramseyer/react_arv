import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { format } from 'date-fns'

vi.mock('../services/estanciasService', () => ({
  getEstancias: vi.fn(() => Promise.resolve([]))
}))

vi.mock('../services/lotesService', () => ({
  getLotesPorEstancia: vi.fn(() => Promise.resolve([]))
}))

vi.mock('../services/cultivosService', () => ({
  getCultivos: vi.fn(() => Promise.resolve([]))
}))

vi.mock('../services/maquinistasService', () => ({
  getMaquinistas: vi.fn(() => Promise.resolve([]))
}))

vi.mock('../services/ordenesFumigacionService', () => ({
  getOrdenesFumigacion: vi.fn(() => Promise.resolve([]))
}))

import { getCultivos } from '../services/cultivosService'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getMaquinistas } from '../services/maquinistasService'
import { getOrdenesFumigacion } from '../services/ordenesFumigacionService'

import BuscarOrden from './BuscarOrden'

describe('BuscarOrden', () => {
  beforeEach(() => {
    getEstancias.mockReset()
    getCultivos.mockReset()
    getMaquinistas.mockReset()
    getLotesPorEstancia.mockReset()
    getOrdenesFumigacion.mockReset()
  })

  it('envia todos los filtros seleccionados', async () => {
    const user = userEvent.setup()

    getEstancias.mockResolvedValueOnce([{ id: 1, nombre: 'Estancia Uno' }])
    getCultivos.mockResolvedValueOnce([{ id: 2, nombre: 'Soja' }])
    getMaquinistas.mockResolvedValueOnce([{ id: 3, nombre: 'Juan Perez' }])
    getLotesPorEstancia.mockResolvedValueOnce([{ id: 10, nombre: 'Lote A' }])
    getOrdenesFumigacion.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <BuscarOrden />
      </MemoryRouter>
    )

    const selects = await screen.findAllByRole('combobox')

    await user.click(selects[0])
    await user.click(screen.getByText('Estancia Uno'))

    await user.click(selects[1])
    await user.click(await screen.findByText('Lote A'))

    await user.click(selects[2])
    await user.click(screen.getByText('Soja'))

    await user.click(selects[3])
    await user.click(screen.getByText('Juan Perez'))

    await user.click(screen.getByRole('button', { name: 'Seleccionar rango' }))
    await user.click(screen.getAllByText('15')[0])
    await user.click(screen.getAllByText('20')[0])

    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    const today = new Date()
    const expectedFrom = format(new Date(today.getFullYear(), today.getMonth(), 15), 'yyyy-MM-dd')
    const expectedTo = format(new Date(today.getFullYear(), today.getMonth(), 20), 'yyyy-MM-dd')

    await waitFor(() => {
      expect(getOrdenesFumigacion).toHaveBeenCalledWith({
        estancia_id: '1',
        lote_id: '10',
        cultivo_id: '2',
        maquinista_id: '3',
        fecha_desde: expectedFrom,
        fecha_hasta: expectedTo,
      })
    })
  })

  it('envia un solo filtro cuando se selecciona uno', async () => {
    const user = userEvent.setup()

    getEstancias.mockResolvedValueOnce([{ id: 5, nombre: 'Estancia Norte' }])
    getCultivos.mockResolvedValueOnce([])
    getMaquinistas.mockResolvedValueOnce([])
    getLotesPorEstancia.mockResolvedValueOnce([])
    getOrdenesFumigacion.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <BuscarOrden />
      </MemoryRouter>
    )

    const selects = await screen.findAllByRole('combobox')

    await user.click(selects[0])
    await user.click(screen.getByText('Estancia Norte'))

    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(getOrdenesFumigacion).toHaveBeenCalledWith({ estancia_id: '5' })
    })
  })

  it('resetea filtros y limpia resultados', async () => {
    const user = userEvent.setup()

    getEstancias.mockResolvedValueOnce([{ id: 1, nombre: 'Estancia Uno' }])
    getCultivos.mockResolvedValueOnce([{ id: 2, nombre: 'Soja' }])
    getMaquinistas.mockResolvedValueOnce([{ id: 3, nombre: 'Juan Perez' }])
    getLotesPorEstancia.mockResolvedValueOnce([{ id: 10, nombre: 'Lote A' }])
    getOrdenesFumigacion.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <BuscarOrden />
      </MemoryRouter>
    )

    const selects = await screen.findAllByRole('combobox')
    const estanciaSelect = selects[0]
    const loteSelect = selects[1]

    await user.click(estanciaSelect)
    await user.click(screen.getByText('Estancia Uno'))

    await user.click(loteSelect)
    await user.click(await screen.findByText('Lote A'))

    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(getOrdenesFumigacion).toHaveBeenCalled()
    })

    expect(await screen.findByText('Sin resultados.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Borrar filtros' }))

    expect(screen.queryByText('Sin resultados.')).not.toBeInTheDocument()
    expect(screen.getByText('Seleccionar estancia')).toBeInTheDocument()
  })
})
