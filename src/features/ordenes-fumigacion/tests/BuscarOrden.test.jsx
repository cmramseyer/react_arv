import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { format } from 'date-fns'

vi.mock('@/features/estancias/api/estanciasService', () => ({
  getEstancias: vi.fn(() => Promise.resolve([]))
}))

vi.mock('@/features/lotes/api/lotesService', () => ({
  getLotesPorEstancia: vi.fn(() => Promise.resolve([]))
}))

vi.mock('@/features/cultivos/api/cultivosService', () => ({
  getCultivos: vi.fn(() => Promise.resolve([]))
}))

vi.mock('@/features/maquinistas/api/maquinistasService', () => ({
  getMaquinistas: vi.fn(() => Promise.resolve([]))
}))

vi.mock('@/features/ordenes-fumigacion/api/ordenesFumigacionService', () => ({
  getOrdenesFumigacion: vi.fn(() => Promise.resolve([]))
}))

import { getCultivos } from '@/features/cultivos/api/cultivosService'
import { getEstancias } from '@/features/estancias/api/estanciasService'
import { getLotesPorEstancia } from '@/features/lotes/api/lotesService'
import { getMaquinistas } from '@/features/maquinistas/api/maquinistasService'
import { getOrdenesFumigacion } from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'

import BuscarOrden from '@/features/ordenes-fumigacion/pages/BuscarOrden'

describe('BuscarOrden', () => {
  beforeEach(() => {
    getEstancias.mockReset()
    getCultivos.mockReset()
    getMaquinistas.mockReset()
    getLotesPorEstancia.mockReset()
    getOrdenesFumigacion.mockReset()
  })

  it.skip('envia todos los filtros seleccionados', async () => {
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

    const inputs = screen.getAllByPlaceholderText('Ingresar...')
    await user.type(inputs[0], 'OC-2024')
    await user.type(inputs[1], 'FAC-900')

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
        nro_orden_cliente: 'OC-2024',
        nro_factura: 'FAC-900',
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
