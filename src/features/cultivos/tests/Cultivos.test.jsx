import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { toast } from 'sonner'

import Cultivos from '@/features/cultivos/pages/Cultivos'
import { cultivoHandlers, resetCultivoMocks } from '@/features/cultivos/mocks/cultivoHandlers'
import { apiBaseUrl } from '@/services/apiUrl'

const server = setupServer(...cultivoHandlers)
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
  resetCultivoMocks()
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

const renderCultivos = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/cultivos']}>
        <Routes>
          <Route path="/cultivos" element={<Cultivos />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Cultivos list', () => {
  it('shows a skeleton while cultivos are loading', async () => {
    server.use(
      http.get(`${API_URL}/cultivos`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json([])
      }),
    )

    renderCultivos()

    expect(screen.getByRole('status', { name: /cargando cultivos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cultivo/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /cargando cultivos/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText('No hay cultivos')).toBeInTheDocument()
  })

  it('renders cultivos after loading', async () => {
    renderCultivos()

    expect(await screen.findByText('Soja')).toBeInTheDocument()
    expect(screen.getByText('Trigo')).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: /cargando cultivos/i })).not.toBeInTheDocument()
  })

  it('disables only the delete button whose mutation is pending', async () => {
    const user = userEvent.setup()
    server.use(
      http.delete(`${API_URL}/cultivos/:id`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderCultivos()
    await screen.findByText('Soja')

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(deleteButtons[0])

    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled()
    expect(deleteButtons[1]).toBeEnabled()
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Eliminando cultivo...',
        success: 'Cultivo eliminado',
        error: 'Hubo un error',
      }),
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /eliminar/i })[0]).toBeEnabled()
    })
  })
})
