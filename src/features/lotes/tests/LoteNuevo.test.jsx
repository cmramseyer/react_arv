import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'

import LoteNew from '@/features/lotes/pages/LoteNew'
import { loteHandlers, resetLoteMocks } from '@/features/lotes/mocks/loteHandlers'
import { estanciaHandlers, resetEstanciaMocks } from '@/features/estancias/mocks/estanciaHandlers'

const server = setupServer(...loteHandlers, ...estanciaHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetLoteMocks()
  resetEstanciaMocks()
})
afterAll(() => server.close())

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

const createQueryClient = () => new QueryClient({
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

describe('LoteNew', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders the form', async () => {
    renderWithQueryClient(
      <MemoryRouter>
        <LoteNew />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Nombre del lote')).toBeInTheDocument()
    expect(screen.getByLabelText('Latitud')).toBeInTheDocument()
    expect(screen.getByLabelText('Longitud')).toBeInTheDocument()
    expect(screen.getByLabelText('Link mapa')).toBeInTheDocument()
    expect(screen.getByLabelText('Hectareas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
    expect(await screen.findByText('Estancia Uno')).toBeInTheDocument()
  })

  it('validates required estancia', async () => {
    renderWithQueryClient(
      <MemoryRouter>
        <LoteNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre del lote'), 'Lote Test')
    await user.type(screen.getByLabelText('Hectareas'), '15')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText('La estancia es obligatoria')).toBeInTheDocument()
  })

  it('creates a lote and navigates to lotes page', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/lotes/new']}>
        <Routes>
          <Route path="/lotes" element={<LocationDisplay />} />
          <Route path="/lotes/new" element={<LoteNew />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(await screen.findByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Estancia Uno' }))
    await user.type(screen.getByLabelText('Nombre del lote'), 'Lote Tres')
    await user.type(screen.getByLabelText('Latitud'), '50')
    await user.type(screen.getByLabelText('Longitud'), '60')
    await user.type(screen.getByLabelText('Link mapa'), 'http://mapa3.com')
    await user.type(screen.getByLabelText('Hectareas'), '15')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
    })
  })

  it('returns to Lotes when clicking Volver', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/lotes/new']}>
        <Routes>
          <Route path="/lotes" element={<LocationDisplay />} />
          <Route path="/lotes/new" element={<LoteNew />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
  })
})
