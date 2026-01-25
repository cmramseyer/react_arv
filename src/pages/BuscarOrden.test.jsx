import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

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
