import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import OrdenFumigacionEdit from '@/features/ordenes-fumigacion/pages/OrdenFumigacionEdit'
import { ordenFumigacionHandlers, resetOrdenFumigacionMocks } from '@/features/ordenes-fumigacion/mocks/ordenFumigacionHandlers'
import { estanciaHandlers } from '@/features/estancias/mocks/estanciaHandlers'
import { loteHandlers } from '@/features/lotes/mocks/loteHandlers'
import { productoHandlers, resetProductoMocks } from '@/features/productos/mocks/productoHandlers'
import { cultivoHandlers } from '@/features/cultivos/mocks/cultivoHandlers'

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
  resetProductoMocks()
})
afterAll(() => server.close())

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

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

describe('OrdenFumigacionEdit with MSW', () => {
  it('updates only the order comments', async () => {
    const user = userEvent.setup()
    let requestBody

    server.use(
      http.patch(`${API_URL}/ordenes_fumigacion/:id`, async ({ params, request }) => {
        requestBody = await request.json()

        return HttpResponse.json({
          id: String(params.id),
          ...requestBody.orden_fumigacion,
        })
      })
    )

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion/1/edit']}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<div>Ordenes Page</div>} />
          <Route path="/ordenes_fumigacion/:id/edit" element={<OrdenFumigacionEdit />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    const comentarios = await screen.findByPlaceholderText('Agregar comentarios')
    await user.clear(comentarios)
    await user.type(comentarios, 'Comentario actualizado')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    })

    expect(requestBody.orden_fumigacion.comentarios).toBe('Comentario actualizado')
    expect(requestBody.orden_fumigacion.estancia_id).toBe('1')
    expect(requestBody.orden_fumigacion.lotes).toHaveLength(1)
  })
})
