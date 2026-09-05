import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { vi } from 'vitest'
import { toast } from 'sonner'

import { apiBaseUrl } from '@/services/apiUrl'
import { ordenFumigacionHandlers, resetOrdenFumigacionMocks } from '@/features/ordenes-fumigacion/mocks/ordenFumigacionHandlers'
import { maquinistaHandlers, resetMaquinistaMocks } from '@/features/maquinistas/mocks/maquinistaHandlers'
import OrdenFumigacionTerminar from '@/features/ordenes-fumigacion/pages/OrdenFumigacionTerminar'

const API_URL = apiBaseUrl

const server = setupServer(...ordenFumigacionHandlers, ...maquinistaHandlers)

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

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetOrdenFumigacionMocks();
  resetMaquinistaMocks();
  vi.clearAllMocks();
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

describe('OrdenFumigacionTerminar', () => {
  it('finishes an order with work details and closes the dialog', async () => {
    const user = userEvent.setup()
    const setIsTerminarDialogOpen = vi.fn()
    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()
    let requestBody
    let requestId

    server.use(
      http.patch(`${API_URL}/ordenes_fumigacion/:id/terminar`, async ({ params, request }) => {
        requestId = params.id
        requestBody = await request.json()

        return HttpResponse.json({ id: String(params.id), estado_orden: 'terminada' })
      })
    )

    renderWithQueryClient(
      <MemoryRouter>
        <OrdenFumigacionTerminar
          selectedOrdenId="1"
          isTerminarDialogOpen
          setIsTerminarDialogOpen={setIsTerminarDialogOpen}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      </MemoryRouter>
    )

    expect(await screen.findByText('Terminar Orden de Fumigación')).toBeInTheDocument()
    expect(screen.getByText(/Estancia Uno/)).toBeInTheDocument()
    expect(screen.getByText(/Lote Uno/)).toBeInTheDocument()
    expect(screen.getByText(/10 ha/)).toBeInTheDocument()

    await user.type(document.querySelector('input[name="datos_clima"]'), 'Soleado')
    await user.type(document.querySelector('input[name="info_trabajo"]'), 'Aplicacion finalizada')
    fireEvent.change(document.querySelector('input[name="fecha_trabajo"]'), {
      target: { value: '2025-01-15' },
    })

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Carlos' }))

    await user.click(screen.getByRole('button', { name: /confirmar terminar/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    expect(setIsTerminarDialogOpen).toHaveBeenCalledWith(false)
    expect(requestId).toBe('1')
    expect(requestBody).toEqual({
      orden_fumigacion: {
        datos_clima: 'Soleado',
        info_trabajo: 'Aplicacion finalizada',
        fecha_trabajo: '2025-01-15',
        maquinista_id: '1',
      },
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Terminando orden de fumigación...',
        success: 'Orden de fumigación terminada',
        error: 'Hubo un error',
      }),
    )
  })
  it('returns to Ordenes without extra requests when clicking Volver', async () => {
    const user = userEvent.setup()
    const setIsTerminarDialogOpen = vi.fn()
    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()
    let terminarRequests = 0

    server.use(
      http.patch(`${API_URL}/ordenes_fumigacion/:id/terminar`, () => {
        terminarRequests += 1
        return HttpResponse.json({ ok: true })
      })
    )

    renderWithQueryClient(
      <MemoryRouter>
        <OrdenFumigacionTerminar
          selectedOrdenId="1"
          isTerminarDialogOpen
          setIsTerminarDialogOpen={setIsTerminarDialogOpen}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      </MemoryRouter>
    )

    await screen.findByText('Terminar Orden de Fumigación')

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(setIsTerminarDialogOpen).toHaveBeenCalledWith(false)
    expect(onSuccess).not.toHaveBeenCalled()
    expect(terminarRequests).toBe(0)
  })

  it('keeps the dialog open when finishing fails', async () => {
    const user = userEvent.setup()
    const setIsTerminarDialogOpen = vi.fn()
    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()

    server.use(
      http.patch(`${API_URL}/ordenes_fumigacion/:id/terminar`, () => {
        return HttpResponse.json({ error: 'Error finishing orden' }, { status: 500 })
      })
    )

    renderWithQueryClient(
      <MemoryRouter>
        <OrdenFumigacionTerminar
          selectedOrdenId="1"
          isTerminarDialogOpen
          setIsTerminarDialogOpen={setIsTerminarDialogOpen}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      </MemoryRouter>
    )

    await screen.findByText('Terminar Orden de Fumigación')

    await user.type(document.querySelector('input[name="datos_clima"]'), 'Soleado')
    await user.click(screen.getByRole('button', { name: /confirmar terminar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          loading: 'Terminando orden de fumigación...',
          success: 'Orden de fumigación terminada',
          error: 'Hubo un error',
        }),
      )
    })
    expect(onSuccess).not.toHaveBeenCalled()
    expect(setIsTerminarDialogOpen).not.toHaveBeenCalledWith(false)
    expect(screen.getByText('Terminar Orden de Fumigación')).toBeInTheDocument()
  })
})
