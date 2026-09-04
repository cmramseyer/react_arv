import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

import Lotes from '@/features/lotes/pages/Lotes'
import { loteHandlers, resetLoteMocks } from '@/features/lotes/mocks/loteHandlers'
import { estanciaHandlers, resetEstanciaMocks } from '@/features/estancias/mocks/estanciaHandlers'
import { apiBaseUrl } from '@/services/apiUrl'

const API_URL = apiBaseUrl

const server = setupServer(...loteHandlers, ...estanciaHandlers)

beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }

  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  resetLoteMocks()
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

const renderLotes = () => {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={['/lotes']}>
      <Routes>
        <Route path="/lotes" element={<Lotes />} />
        <Route path="/lotes/new" element={<LocationDisplay />} />
        <Route path="/lotes/:id" element={<LocationDisplay />} />
        <Route path="/lotes/:id/edit" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Lotes list', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('shows a skeleton while lotes are loading', async () => {
    server.use(
      http.get(`${API_URL}/lotes`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json([])
      }),
    )

    renderLotes()

    expect(screen.getByRole('status', { name: /cargando lotes/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /cargando lotes/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText('No hay lotes')).toBeInTheDocument()
  })

  it('fetches lotes and shows them in the table', async () => {
    renderLotes()

    expect(await screen.findByText('Lote Uno')).toBeInTheDocument()
    expect(screen.getByText('Lote Dos')).toBeInTheDocument()
    expect(screen.getAllByText('Estancia Uno').length).toBeGreaterThan(0)
    expect(screen.getByText('Todas las estancias')).toBeInTheDocument()
  })

  it('navigates to create, detail, and edit pages', async () => {
    renderLotes()

    await screen.findByText('Lote Uno')

    await user.click(screen.getByRole('button', { name: /crear lote/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/lotes/new')
  })

  it('navigates to detail and edit from the list', async () => {
    renderLotes()

    await screen.findByText('Lote Uno')

    await user.click(screen.getAllByRole('button', { name: /ver/i })[0])
    expect(screen.getByTestId('location')).toHaveTextContent('/lotes/1')
  })

  it('navigates to edit from the list', async () => {
    renderLotes()

    await screen.findByText('Lote Uno')

    await user.click(screen.getAllByRole('button', { name: /editar/i })[0])
    expect(screen.getByTestId('location')).toHaveTextContent('/lotes/1/edit')
  })

  it('deletes a lote and refreshes the list', async () => {
    renderLotes()

    await screen.findByText('Lote Uno')

    await user.click(screen.getAllByRole('button', { name: /eliminar/i })[0])

    await waitFor(() => {
      expect(screen.queryByText('Lote Uno')).not.toBeInTheDocument()
      expect(screen.getByText('Lote Dos')).toBeInTheDocument()
    })
  })
})
