import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { toast } from 'sonner'

import MaquinistaNew from '@/features/maquinistas/pages/MaquinistaNew'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
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

describe('MaquinistaNew', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('creates a maquinista and returns to Maquinistas', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/maquinistas/new']}>
        <Routes>
          <Route path="/maquinistas" element={<div>Maquinistas Page</div>} />
          <Route path="/maquinistas/new" element={<MaquinistaNew />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/nombre/i), 'Pedro')
    await user.click(screen.getByRole('button', { name: /grabar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/maquinistas')
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Guardando maquinista...',
        success: 'Maquinista creado',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the new page and keeps form values when creation fails', async () => {
    server.use(
      http.post(`${API_URL}/maquinistas`, () => {
        return HttpResponse.json({ error: 'Error creating maquinista' }, { status: 500 })
      }),
    )
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/maquinistas/new']}>
        <Routes>
          <Route path="/maquinistas" element={<div>Maquinistas Page</div>} />
          <Route path="/maquinistas/new" element={<MaquinistaNew />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/nombre/i), 'Maquinista Fallido')
    await user.click(screen.getByRole('button', { name: /grabar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/maquinistas/new')
    expect(screen.getByDisplayValue('Maquinista Fallido')).toBeInTheDocument()
  })
})
