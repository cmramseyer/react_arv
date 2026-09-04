import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { toast } from 'sonner'

import EstanciaEdit from '@/features/estancias/pages/EstanciaEdit'
import { estanciaHandlers, resetEstanciaMocks } from '@/features/estancias/mocks/estanciaHandlers'
import { apiBaseUrl } from '@/services/apiUrl'

const server = setupServer(...estanciaHandlers)
const API_URL = apiBaseUrl

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
  resetEstanciaMocks()
  vi.clearAllMocks()
})
afterAll(() => server.close())

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('EstanciaEdit', () => {
  it('updates an estancia and returns to Estancias', async () => {
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={['/estancias/1/edit']}>
          <Routes>
            <Route path="/estancias" element={<div>Estancias Page</div>} />
            <Route path="/estancias/:id/edit" element={<EstanciaEdit />} />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const nombre = await screen.findByDisplayValue('Estancia Uno')
    await user.clear(nombre)
    await user.type(nombre, 'Estancia Actualizada')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/estancias')
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Actualizando estancia...',
        success: 'Estancia actualizada',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the edit page and keeps form values when the update fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch(`${API_URL}/estancias/:id`, () => {
        return HttpResponse.json({ error: 'Error updating estancia' }, { status: 500 })
      }),
    )

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={['/estancias/1/edit']}>
          <Routes>
            <Route path="/estancias" element={<div>Estancias Page</div>} />
            <Route path="/estancias/:id/edit" element={<EstanciaEdit />} />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const nombre = await screen.findByDisplayValue('Estancia Uno')
    await user.clear(nombre)
    await user.type(nombre, 'Cambio que falla')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/estancias/1/edit')
    expect(screen.getByDisplayValue('Cambio que falla')).toBeInTheDocument()
  })
})
