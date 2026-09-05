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
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

vi.mock('sonner', () => ({
  // Mimics real Sonner: with a loading message, toast.promise returns a
  // non-rejecting wrapper instead of the original promise, so awaiting it
  // never throws. Control flow must await the mutation promise itself.
  toast: {
    promise: vi.fn((promise) => {
      promise.catch(() => {})
      return { unwrap: () => promise }
    }),
  },
}))

const facturasPagoFixture = [
  {
    id: 5,
    fecha_factura_ddmmyyyy: '12/01/2026',
    nro_factura: 'FAC-001',
    ordenes_fumigacion: [
      {
        id: 101,
        nombre_estancia: 'Estancia Alfa',
        importe: 100,
        lotes: [],
      },
    ],
  },
]

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

  it('shows a skeleton while pending orders are loading', async () => {
    let resolveRequest
    getOrdenesPendientesFacturacion.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = () => resolve(ordenesFixture)
        })
    )

    renderWithQueryClient(
      <MemoryRouter>
        <Facturacion />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('status', { name: /cargando facturación pendiente/i })
    ).toBeInTheDocument()

    resolveRequest()

    expect(
      await screen.findByRole('checkbox', { name: /seleccionar orden 101/i })
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByRole('status', { name: /cargando facturación pendiente/i })
      ).not.toBeInTheDocument()
    })
  })

  it('shows a skeleton while payment invoices are loading', async () => {
    getOrdenesPendientesFacturacion.mockResolvedValueOnce([])
    let resolveRequest
    getFacturasPago.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = () => resolve(facturasPagoFixture)
        })
    )

    renderWithQueryClient(
      <MemoryRouter>
        <Facturacion />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('switch', { name: /cambiar modo/i }))

    expect(
      screen.getByRole('status', { name: /cargando facturas para pago/i })
    ).toBeInTheDocument()

    resolveRequest()

    expect(await screen.findByText('Factura #5')).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByRole('status', { name: /cargando facturas para pago/i })
      ).not.toBeInTheDocument()
    })
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
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Guardando factura...',
        success: 'Factura creada',
        error: 'Hubo un error',
      }),
    )
  })

  it('keeps the selection when facturar rejects', async () => {
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
        ],
      },
    ])
    facturarOrdenes.mockRejectedValueOnce(new Error('Error creating factura'))

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
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          loading: 'Guardando factura...',
          success: 'Factura creada',
          error: 'Hubo un error',
        }),
      )
    })
    expect(checkbox).toBeChecked()
    expect(screen.getByText('1 ordenes seleccionadas')).toBeInTheDocument()
  })

  it('shows an error toast and keeps the selection when the backend reports ok false', async () => {
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
        ],
      },
    ])
    facturarOrdenes.mockResolvedValueOnce({ ok: false })

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
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          loading: 'Guardando factura...',
          success: 'Factura creada',
          error: 'Hubo un error',
        }),
      )
    })
    expect(checkbox).toBeChecked()
    expect(screen.getByText('1 ordenes seleccionadas')).toBeInTheDocument()
  })

  it('treats a 201 response without an ok field as success', async () => {
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
        ],
      },
    ])
    facturarOrdenes.mockResolvedValueOnce({
      id: '9',
      nro_factura: 'FAC-2026-009',
    })

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
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          loading: 'Guardando factura...',
          success: 'Factura creada',
          error: 'Hubo un error',
        }),
      )
    })
    await waitFor(() => {
      expect(screen.getByText('0 ordenes seleccionadas')).toBeInTheDocument()
    })
  })

  it('marks a factura as paid with toast feedback and closes the dialog', async () => {
    getOrdenesPendientesFacturacion.mockResolvedValue([])
    getFacturasPago.mockResolvedValue(facturasPagoFixture)
    marcarFacturaPagada.mockResolvedValue(undefined)

    renderWithQueryClient(
      <MemoryRouter>
        <Facturacion />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('switch', { name: /cambiar modo/i }))
    await screen.findByText('Factura #5')
    await user.click(screen.getByRole('button', { name: /marcar como pagado/i }))
    await screen.findByText('Confirmar pago')

    const now = new Date()
    const day = now.getDate() === 15 ? 16 : 15
    const target = new Date(now.getFullYear(), now.getMonth(), day)
    await user.click(screen.getByRole('button', { name: /seleccionar fecha/i }))
    await user.click(
      await screen.findByRole('button', {
        name: format(target, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
      }),
    )
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }))

    const fechaPago = format(target, 'yyyy-MM-dd')
    await waitFor(() => {
      expect(marcarFacturaPagada).toHaveBeenCalledWith(5, fechaPago)
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Marcando factura como pagada...',
        success: 'Factura marcada como pagada',
        error: 'Hubo un error',
      }),
    )
    await waitFor(() => {
      expect(screen.queryByText('Confirmar pago')).not.toBeInTheDocument()
    })
  })

  it('keeps the pago dialog open when marking as paid fails', async () => {
    getOrdenesPendientesFacturacion.mockResolvedValue([])
    getFacturasPago.mockResolvedValue(facturasPagoFixture)
    marcarFacturaPagada.mockRejectedValueOnce(new Error('Error updating factura'))

    renderWithQueryClient(
      <MemoryRouter>
        <Facturacion />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('switch', { name: /cambiar modo/i }))
    await screen.findByText('Factura #5')
    await user.click(screen.getByRole('button', { name: /marcar como pagado/i }))
    await screen.findByText('Confirmar pago')

    const now = new Date()
    const day = now.getDate() === 15 ? 16 : 15
    const target = new Date(now.getFullYear(), now.getMonth(), day)
    await user.click(screen.getByRole('button', { name: /seleccionar fecha/i }))
    await user.click(
      await screen.findByRole('button', {
        name: format(target, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
      }),
    )
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          loading: 'Marcando factura como pagada...',
          success: 'Factura marcada como pagada',
          error: 'Hubo un error',
        }),
      )
    })
    expect(screen.getByText('Confirmar pago')).toBeInTheDocument()
  })
})
