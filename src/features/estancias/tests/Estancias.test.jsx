import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

import Estancias from '@/features/estancias/pages/Estancias'
import { estanciaHandlers, resetEstanciaMocks } from '@/features/estancias/mocks/estanciaHandlers'
import { apiBaseUrl } from '@/services/apiUrl'

const server = setupServer(...estanciaHandlers)
const API_URL = apiBaseUrl

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetEstanciaMocks()
})
afterAll(() => server.close())

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderEstancias = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/estancias']}>
        <Routes>
          <Route path="/estancias" element={<Estancias />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Estancias list', () => {
  it('shows a skeleton while estancias are loading', async () => {
    server.use(
      http.get(`${API_URL}/estancias`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json([])
      }),
    )

    renderEstancias()

    expect(screen.getByRole('status', { name: /cargando estancias/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear estancia/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /cargando estancias/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText('No hay estancias')).toBeInTheDocument()
  })

  it('renders estancias after loading', async () => {
    renderEstancias()

    expect(await screen.findByText('Estancia Uno')).toBeInTheDocument()
    expect(screen.getByText('Estancia Dos')).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: /cargando estancias/i })).not.toBeInTheDocument()
  })

  it('disables only the delete button whose mutation is pending', async () => {
    const user = userEvent.setup()
    server.use(
      http.delete(`${API_URL}/estancias/:id`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderEstancias()
    await screen.findByText('Estancia Uno')

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(deleteButtons[0])

    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled()
    expect(deleteButtons[1]).toBeEnabled()

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /eliminar/i })[0]).toBeEnabled()
    })
  })
})
