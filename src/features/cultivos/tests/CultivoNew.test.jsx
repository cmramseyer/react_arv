import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { toast } from 'sonner'

import CultivoNew from '@/features/cultivos/pages/CultivoNew'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
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

const renderWithQueryClient = (ui, queryClient = createQueryClient()) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('CultivoNew', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('creates a cultivo and returns to Cultivos', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/cultivos/new']}>
        <Routes>
          <Route path="/cultivos" element={<div>Cultivos Page</div>} />
          <Route path="/cultivos/new" element={<CultivoNew />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/nombre/i), 'Maiz')
    await user.click(screen.getByRole('button', { name: /grabar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/cultivos')
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Guardando cultivo...',
        success: 'Cultivo creado',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the new page and keeps form values when creation fails', async () => {
    server.use(
      http.post(`${API_URL}/cultivos`, () => {
        return HttpResponse.json({ error: 'Error creating cultivo' }, { status: 500 })
      }),
    )
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/cultivos/new']}>
        <Routes>
          <Route path="/cultivos" element={<div>Cultivos Page</div>} />
          <Route path="/cultivos/new" element={<CultivoNew />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/nombre/i), 'Cultivo Fallido')
    await user.click(screen.getByRole('button', { name: /grabar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/cultivos/new')
    expect(screen.getByDisplayValue('Cultivo Fallido')).toBeInTheDocument()
  })
})
