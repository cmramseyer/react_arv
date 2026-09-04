import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import EstanciaNew from '@/features/estancias/pages/EstanciaNew'
import { setupServer } from 'msw/node'
import { estanciaHandlers, resetEstanciaMocks } from '@/features/estancias/mocks/estanciaHandlers'

const server = setupServer(...estanciaHandlers)

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

describe('EstanciaNew', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('returns to Estancias when clicking Volver', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/estancias', '/estancias/new']} initialIndex={1}>
        <Routes>
          <Route path="/estancias" element={<div>Estancias Page</div>} />
          <Route path="/estancias/new" element={<EstanciaNew />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/estancias')
  })

  it('creates an estancia and returns to Estancias', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/estancias/new']}>
        <Routes>
          <Route path="/estancias" element={<div>Estancias Page</div>} />
          <Route path="/estancias/new" element={<EstanciaNew />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nombre'), 'Estancia Nueva')
    await user.click(screen.getByRole('button', { name: /grabar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/estancias')
    })
  })
})
