import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { vi } from 'vitest'
import { toast } from 'sonner'

import { apiBaseUrl } from '@/services/apiUrl'
import OrdenFumigacionEdit from '@/features/ordenes-fumigacion/pages/OrdenFumigacionEdit'
import { mapOrdenFumigacionFormValuesToPayload } from '@/features/ordenes-fumigacion/mappers/ordenFumigacionMappers'
import { ordenFumigacionHandlers, resetOrdenFumigacionMocks } from '@/features/ordenes-fumigacion/mocks/ordenFumigacionHandlers'
import { estanciaHandlers } from '@/features/estancias/mocks/estanciaHandlers'
import { loteHandlers } from '@/features/lotes/mocks/loteHandlers'
import { productoHandlers, resetProductoMocks } from '@/features/productos/mocks/productoHandlers'
import { cultivoHandlers } from '@/features/cultivos/mocks/cultivoHandlers'

const API_URL = apiBaseUrl

const server = setupServer(
  ...ordenFumigacionHandlers,
  ...estanciaHandlers,
  ...loteHandlers,
  ...productoHandlers,
  ...cultivoHandlers,
)

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

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetOrdenFumigacionMocks()
  resetProductoMocks()
  vi.clearAllMocks()
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
  it('maps manual updates and persisted line deletions', () => {
    const payload = mapOrdenFumigacionFormValuesToPayload({
      estancia_id: '1',
      sensible: false,
      comentarios: '',
      lotes: [
        {
          orden_lote_id: '201',
          es_manual: true,
          nombre_manual: 'Sector detrás del galpón',
          hectareas_reales: '7.25',
          dosis: [],
        },
        {
          orden_lote_id: '101',
          lote_id: '1',
          eliminado: true,
          dosis: [],
        },
      ],
    })

    expect(payload.orden_fumigacion.lotes).toEqual([
      {
        id: '201',
        nombre_manual: 'Sector detrás del galpón',
        hectareas_reales: 7.25,
        dosis: [],
      },
      { id: '101', _destroy: true },
    ])
  })

  it('updates an order with optional doses', async () => {
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
    expect(requestBody.orden_fumigacion.lotes[0]).toMatchObject({
      id: '101',
      lote_id: '1',
      dosis: [
        { id: '1001', producto_id: '1', cantidad: 2 },
      ],
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Actualizando orden de fumigación...',
        success: 'Orden de fumigación actualizada',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the edit page and keeps form values when the update fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch(`${API_URL}/ordenes_fumigacion/:id`, () => {
        return HttpResponse.json({ error: 'Error updating orden' }, { status: 500 })
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
    await user.type(comentarios, 'Cambio que falla')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion/1/edit')
    expect(screen.getByDisplayValue('Cambio que falla')).toBeInTheDocument()
  })
})
