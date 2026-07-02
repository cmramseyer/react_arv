import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import EstanciaNew from '@/features/estancias/pages/EstanciaNew'

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
})
