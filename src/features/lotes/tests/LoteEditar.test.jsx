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
import LoteEdit from '@/features/lotes/pages/LoteEdit'
import { loteHandlers, resetLoteMocks } from '@/features/lotes/mocks/loteHandlers'
import { estanciaHandlers, resetEstanciaMocks } from '@/features/estancias/mocks/estanciaHandlers'

const API_URL = apiBaseUrl
const server = setupServer(...loteHandlers, ...estanciaHandlers)

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
  resetLoteMocks()
  resetEstanciaMocks()
  vi.clearAllMocks()
})
afterAll(() => server.close())

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
    mutations: { retry: false },
  },
})

const renderWithQueryClient = (ui, queryClient = createQueryClient()) => {
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  }
}

describe('LoteEdit', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders the form with fetched data', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/lotes/1/edit']}>
        <Routes>
          <Route path="/lotes/:id/edit" element={<LoteEdit />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByDisplayValue('Lote Uno')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument()
  })

  it('updates a lote and navigates back', async () => {
    let requestFormData

    server.use(
      http.patch(`${API_URL}/lotes/:id`, async ({ params, request }) => {
        requestFormData = await request.formData()
        return HttpResponse.json({
          id: Number(params.id),
          nombre: requestFormData.get('lote[nombre]'),
          estancia_id: requestFormData.get('lote[estancia_id]'),
          lat: requestFormData.get('lote[lat]'),
          long: requestFormData.get('lote[long]'),
          link_mapa: requestFormData.get('lote[link_mapa]'),
          hectareas: Number(requestFormData.get('lote[hectareas]')),
        })
      })
    )

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/lotes/1/edit']}>
        <Routes>
          <Route path="/lotes" element={<LocationDisplay />} />
          <Route path="/lotes/:id/edit" element={<LoteEdit />} />
        </Routes>
      </MemoryRouter>
    )

    const nombre = await screen.findByDisplayValue('Lote Uno')
    await user.clear(nombre)
    await user.type(nombre, 'Lote Tres')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
    })

    expect(requestFormData.get('lote[nombre]')).toBe('Lote Tres')
    expect(requestFormData.get('lote[estancia_id]')).toBe('1')
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Actualizando lote...',
        success: 'Lote actualizado',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the edit page and keeps form values when the update fails', async () => {
    server.use(
      http.patch(`${API_URL}/lotes/:id`, () => {
        return HttpResponse.json({ error: 'Error updating lote' }, { status: 500 })
      }),
    )

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/lotes/1/edit']}>
        <Routes>
          <Route path="/lotes" element={<LocationDisplay />} />
          <Route path="/lotes/:id/edit" element={<LoteEdit />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    const nombre = await screen.findByDisplayValue('Lote Uno')
    await user.clear(nombre)
    await user.type(nombre, 'Cambio que falla')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/lotes/1/edit')
    expect(screen.getByDisplayValue('Cambio que falla')).toBeInTheDocument()
  })

  it('returns to Lotes when clicking Volver', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/lotes/1/edit']}>
        <Routes>
          <Route path="/lotes" element={<LocationDisplay />} />
          <Route path="/lotes/:id/edit" element={<LoteEdit />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByDisplayValue('Lote Uno')
    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
  })
})
