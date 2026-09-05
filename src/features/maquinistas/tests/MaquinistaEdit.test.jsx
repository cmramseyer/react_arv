import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { toast } from 'sonner'

import MaquinistaEdit from '@/features/maquinistas/pages/MaquinistaEdit'
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

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

const renderMaquinistaEdit = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/maquinistas/1/edit']}>
        <Routes>
          <Route path="/maquinistas" element={<div>Maquinistas Page</div>} />
          <Route path="/maquinistas/:id/edit" element={<MaquinistaEdit />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MaquinistaEdit', () => {
  it('updates a maquinista and returns to Maquinistas', async () => {
    const user = userEvent.setup()
    renderMaquinistaEdit()

    const nombreInput = await screen.findByDisplayValue('Carlos')
    await user.clear(nombreInput)
    await user.type(nombreInput, 'Carlos actualizado')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/maquinistas')
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Actualizando maquinista...',
        success: 'Maquinista actualizado',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the edit page and keeps form values when the update fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch(`${API_URL}/maquinistas/:id`, () => {
        return HttpResponse.json({ error: 'Error updating maquinista' }, { status: 500 })
      }),
    )
    renderMaquinistaEdit()

    const nombreInput = await screen.findByDisplayValue('Carlos')
    await user.clear(nombreInput)
    await user.type(nombreInput, 'Cambio que falla')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/maquinistas/1/edit')
    expect(screen.getByDisplayValue('Cambio que falla')).toBeInTheDocument()
  })
})
