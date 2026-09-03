import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

import MaquinistaList from '@/features/maquinistas/components/MaquinistaList'
import { maquinistaHandlers, resetMaquinistaMocks } from '@/features/maquinistas/mocks/maquinistaHandlers'
import { apiUrl } from '@/services/apiUrl'

export const server = setupServer(...maquinistaHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetMaquinistaMocks()
})
afterAll(() => server.close())

const renderWithQueryClient = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

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

describe('MaquinistaList', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('shows a skeleton while maquinistas are loading', async () => {
    server.use(
      http.get(apiUrl('maquinistas'), async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json([])
      })
    )

    renderWithQueryClient(
      <MemoryRouter>
        <MaquinistaList />
      </MemoryRouter>
    )

    expect(screen.getByRole('status', { name: /cargando maquinistas/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /cargando maquinistas/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText('No hay maquinistas')).toBeInTheDocument()
  })

  it('renders maquinistas in the table', async () => {
    renderWithQueryClient(
      <MemoryRouter>
        <MaquinistaList />
      </MemoryRouter>
    )

    expect(await screen.findByText('Carlos')).toBeInTheDocument()
    expect(screen.getByText('Juan')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument()
  })

  it('navigates to edit page when clicking edit', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/maquinistas']}>
        <MaquinistaList />
        <LocationDisplay />
      </MemoryRouter>
    )

    const carlosCell = await screen.findByText('Carlos')
    const row = carlosCell.closest('tr')

    await user.click(within(row).getByRole('button', { name: /editar/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/maquinistas/1/edit')
  })

  it('deletes maquinista from the table', async () => {
    renderWithQueryClient(
      <MemoryRouter>
        <MaquinistaList />
      </MemoryRouter>
    )

    const carlosCell = await screen.findByText('Carlos')
    expect(screen.getByText('Juan')).toBeInTheDocument()

    const row = carlosCell.closest('tr')
    await user.click(within(row).getByRole('button', { name: /eliminar/i }))

    await waitFor(() => {
      expect(screen.queryByText('Carlos')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Juan')).toBeInTheDocument()
  })
})
