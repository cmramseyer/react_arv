import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import OrdenFumigacionForm from '@/features/ordenes-fumigacion/components/OrdenFumigacionForm'
import { ordenFumigacionHandlers, resetOrdenFumigacionMocks } from '@/features/ordenes-fumigacion/mocks/ordenFumigacionHandlers'
import { estanciaHandlers, resetEstanciaMocks } from '@/features/estancias/mocks/estanciaHandlers'
import { loteHandlers, resetLoteMocks } from '@/features/lotes/mocks/loteHandlers'
import { productoHandlers, resetProductoMocks } from '@/features/productos/mocks/productoHandlers'
import { cultivoHandlers, resetCultivoMocks } from '@/features/cultivos/mocks/cultivoHandlers'

const API_URL = `http://${import.meta.env.VITE_API_URL}`

const server = setupServer(
  ...ordenFumigacionHandlers,
  ...estanciaHandlers,
  ...loteHandlers,
  ...productoHandlers,
  ...cultivoHandlers,
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetOrdenFumigacionMocks()
  resetEstanciaMocks()
  resetLoteMocks()
  resetProductoMocks()
  resetCultivoMocks()
})
afterAll(() => server.close())

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithQueryClient = (ui) => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      {ui}
    </QueryClientProvider>
  )
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('OrdenFumigacionForm', () => {
  it('creates a complete fumigation order and navigates back', async () => {
    const user = userEvent.setup()
    let requestBody

    server.use(
      http.post(`${API_URL}/ordenes_fumigacion`, async ({ request }) => {
        requestBody = await request.json()

        return HttpResponse.json({ id: '3', ...requestBody.orden_fumigacion }, { status: 201 })
      })
    )

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion/new']}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<LocationDisplay />} />
          <Route path="/ordenes_fumigacion/new" element={<OrdenFumigacionForm formAction="create" />} />
        </Routes>
      </MemoryRouter>
    )

    const selects = await screen.findAllByRole('combobox')

    await user.click(selects[0])
    await user.click(await screen.findByRole('option', { name: 'Estancia Uno' }))

    await user.click(selects[1])
    await user.click(await screen.findByRole('option', { name: 'Trigo' }))

    await user.click(selects[2])
    await user.click(await screen.findByRole('option', { name: 'Lote Uno - 10 ha' }))

    await user.click(screen.getByLabelText('Producto'))
    await user.click(await screen.findByRole('option', { name: 'Roundup' }))

    const numberInputs = screen.getAllByRole('spinbutton')
    await user.clear(numberInputs[0])
    await user.type(numberInputs[0], '9.5')
    await user.clear(numberInputs[1])
    await user.type(numberInputs[1], '2.5')

    await user.type(screen.getByPlaceholderText('Agregar comentarios'), 'Aplicacion completa')
    await user.click(screen.getByRole('button', { name: /crear/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    })

    expect(requestBody).toEqual({
      orden_fumigacion: {
        estancia_id: '1',
        sensible: false,
        comentarios: 'Aplicacion completa',
        lotes: [
          {
            id: null,
            lote_id: '1',
            dosis: [
              {
                id: null,
                producto_id: '1',
                cantidad: 2.5,
              },
            ],
            hectareas_reales: 9.5,
          },
        ],
        cultivo_id: '2',
      },
    })
  })
})
