import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/features/maquinistas/api/maquinistasService', () => ({
  createMaquinista: vi.fn(),
}))

import { createMaquinista } from '@/features/maquinistas/api/maquinistasService'
import MaquinistaNueva from '@/features/maquinistas/pages/MaquinistaNew'

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

describe('MaquinistaNueva', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    createMaquinista.mockClear()
  })

  it('does not create a maquinista on initial render', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/maquinistas', '/maquinistas/nuevo']} initialIndex={1}>
        <Routes>
          <Route path="/maquinistas" element={<div>Maquinistas Page</div>} />
          <Route path="/maquinistas/nuevo" element={<MaquinistaNueva />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    expect(screen.getByTestId('location')).toHaveTextContent('/maquinistas/nuevo')
    expect(createMaquinista).not.toHaveBeenCalled()
  })
})
