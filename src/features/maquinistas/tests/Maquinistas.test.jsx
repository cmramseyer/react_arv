import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { toast } from 'sonner'

import Maquinistas from '@/features/maquinistas/pages/Maquinistas'
import { maquinistaHandlers, resetMaquinistaMocks } from '@/features/maquinistas/mocks/maquinistaHandlers'
import { apiBaseUrl } from '@/services/apiUrl'

const server = setupServer(...maquinistaHandlers)
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
  resetMaquinistaMocks()
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

const renderMaquinistas = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/maquinistas']}>
        <Routes>
          <Route path="/maquinistas" element={<Maquinistas />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Maquinistas list', () => {
  it('shows a skeleton while maquinistas are loading', async () => {
    server.use(
      http.get(`${API_URL}/maquinistas`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json([])
      }),
    )

    renderMaquinistas()

    expect(screen.getByRole('status', { name: /cargando maquinistas/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear maquinista/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /cargando maquinistas/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText('No hay maquinistas')).toBeInTheDocument()
  })

  it('renders maquinistas after loading', async () => {
    renderMaquinistas()

    expect(await screen.findByText('Carlos')).toBeInTheDocument()
    expect(screen.getByText('Juan')).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: /cargando maquinistas/i })).not.toBeInTheDocument()
  })

  it('disables only the delete button whose mutation is pending', async () => {
    const user = userEvent.setup()
    server.use(
      http.delete(`${API_URL}/maquinistas/:id`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderMaquinistas()
    await screen.findByText('Carlos')

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(deleteButtons[0])

    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled()
    expect(deleteButtons[1]).toBeEnabled()
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Eliminando maquinista...',
        success: 'Maquinista eliminado',
        error: 'Hubo un error',
      }),
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /eliminar/i })[0]).toBeEnabled()
    })
  })
})
