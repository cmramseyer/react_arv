import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../api/ordenesFumigacionService', () => ({
  getOrdenesPendientesFacturacion: vi.fn(),
  facturarOrdenes: vi.fn(),
}))

vi.mock('../api/facturasService', () => ({
  getFacturasPago: vi.fn(),
  marcarFacturaPagada: vi.fn(),
}))

import { facturarOrdenes, getOrdenesPendientesFacturacion } from '../api/ordenesFumigacionService'
import { getFacturasPago, marcarFacturaPagada } from '../api/facturasService'
import Facturacion from '../pages/Facturacion'

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithQueryClient = (ui, queryClient = createQueryClient()) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

const ordenesFixture = [
  {
    id: 1,
    nombre: 'Estancia Alfa',
    data: [
      {
        orden_id: 101,
        lote_id: 'Lote A',
        hectareas: 10,
        fecha_trabajo_ddmmyyyy: '10/01/2026',
        maquinista: 'Juan Perez',
        nombre_estancia: 'Estancia Alfa',
      },
    ],
  },
  {
    id: 2,
    nombre: 'Estancia Beta',
    data: [
      {
        orden_id: 202,
        lote_id: 'Lote B',
        hectareas: 8,
        fecha_trabajo_ddmmyyyy: '11/01/2026',
        maquinista: 'Maria Lopez',
        nombre_estancia: 'Estancia Beta',
      },
    ],
  },
]

describe('Facturacion', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  it('shows a dialog when selecting orders from different estancias', async () => {
    getOrdenesPendientesFacturacion.mockResolvedValueOnce(ordenesFixture)

    renderWithQueryClient(
      <MemoryRouter>
        <Facturacion />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getOrdenesPendientesFacturacion).toHaveBeenCalledTimes(1)
    })

    const checkboxUno = await screen.findByRole('checkbox', { name: /seleccionar orden 101/i })
    const checkboxDos = screen.getByRole('checkbox', { name: /seleccionar orden 202/i })

    await user.click(checkboxUno)

    expect(checkboxUno).toBeChecked()

    await user.click(checkboxDos)

    expect(
      await screen.findByText(
        'No se puede crear una factura con órdenes de diferentes propietarios'
      )
    ).toBeInTheDocument()
    expect(checkboxDos).not.toBeChecked()
  })

  it('calculates the amount from the total hectares and price for each order', async () => {
    getOrdenesPendientesFacturacion.mockResolvedValue([
      {
        id: 1,
        nombre: 'Estancia Alfa',
        data: [
          {
            orden_id: 101,
            lote_id: 'Lote A',
            hectareas: 10,
            nombre_estancia: 'Estancia Alfa',
          },
          {
            orden_id: 101,
            lote_id: 'Lote B',
            hectareas: 2.5,
            nombre_estancia: 'Estancia Alfa',
          },
        ],
      },
    ])
    facturarOrdenes.mockResolvedValueOnce({ ok: true })

    renderWithQueryClient(
      <MemoryRouter>
        <Facturacion />
      </MemoryRouter>
    )

    const checkbox = await screen.findByRole('checkbox', { name: /seleccionar orden 101/i })
    await user.click(checkbox)
    await user.type(screen.getByRole('textbox', { name: /precio de orden 101/i }), '12,50')
    await user.click(screen.getByRole('button', { name: 'Facturar' }))

    await waitFor(() => {
      expect(facturarOrdenes).toHaveBeenCalledWith({
        ordenes_fumigacion: [{ id: 101, importe: 156.25 }],
        nro_factura: undefined,
      })
    })
  })
})
