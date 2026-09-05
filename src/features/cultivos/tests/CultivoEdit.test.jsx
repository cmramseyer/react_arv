import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { toast } from 'sonner'

import CultivoEdit from '@/features/cultivos/pages/CultivoEdit'
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

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

const renderCultivoEdit = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/cultivos/1/edit']}>
        <Routes>
          <Route path="/cultivos" element={<div>Cultivos Page</div>} />
          <Route path="/cultivos/:id/edit" element={<CultivoEdit />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CultivoEdit', () => {
  it('updates a cultivo and returns to Cultivos', async () => {
    const user = userEvent.setup()
    renderCultivoEdit()

    const nombreInput = await screen.findByDisplayValue('Soja')
    await user.clear(nombreInput)
    await user.type(nombreInput, 'Maiz')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/cultivos')
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Actualizando cultivo...',
        success: 'Cultivo actualizado',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the edit page and keeps form values when the update fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch(`${API_URL}/cultivos/:id`, () => {
        return HttpResponse.json({ error: 'Error updating cultivo' }, { status: 500 })
      }),
    )
    renderCultivoEdit()

    const nombreInput = await screen.findByDisplayValue('Soja')
    await user.clear(nombreInput)
    await user.type(nombreInput, 'Cambio que falla')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/cultivos/1/edit')
    expect(screen.getByDisplayValue('Cambio que falla')).toBeInTheDocument()
  })
})
