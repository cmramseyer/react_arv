import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/features/cultivos/api/cultivosService', () => ({
  createCultivo: vi.fn(),
}))

import { createCultivo } from '@/features/cultivos/api/cultivosService'
import CultivoNueva from '@/features/cultivos/pages/CultivoNew'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })

const renderWithQueryClient = (ui, queryClient = createQueryClient()) => {
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  }
}

describe('CultivoNueva', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    createCultivo.mockClear()
  })

  it('does not create a cultivo on initial render', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/cultivos', '/cultivos/nuevo']} initialIndex={1}>
        <Routes>
          <Route path="/cultivos" element={<div>Cultivos Page</div>} />
          <Route path="/cultivos/nuevo" element={<CultivoNueva />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    expect(screen.getByTestId('location')).toHaveTextContent('/cultivos/nuevo')
    expect(createCultivo).not.toHaveBeenCalled()
  })
})
