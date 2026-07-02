import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'

import CultivoList from '@/features/cultivos/components/CultivoList'
import { cultivoHandlers, resetCultivoMocks } from '@/features/cultivos/mocks/cultivoHandlers'

export const server = setupServer(...cultivoHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetCultivoMocks()
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

describe('CultivoList', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders cultivos in the table', async () => {
    renderWithQueryClient(
      <MemoryRouter>
        <CultivoList />
      </MemoryRouter>
    )

    expect(await screen.findByText('Soja')).toBeInTheDocument()
    expect(screen.getByText('Trigo')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument()
  })

  it('navigates to edit page when clicking edit', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/cultivos']}>
        <CultivoList />
        <LocationDisplay />
      </MemoryRouter>
    )

    const sojaCell = await screen.findByText('Soja')
    const row = sojaCell.closest('tr')

    await user.click(within(row).getByRole('button', { name: /editar/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/cultivos/1/edit')
  })

  it('deletes cultivo from the table', async () => {
    renderWithQueryClient(
      <MemoryRouter>
        <CultivoList />
      </MemoryRouter>
    )

    const sojaCell = await screen.findByText('Soja')
    expect(screen.getByText('Trigo')).toBeInTheDocument()

    const row = sojaCell.closest('tr')
    await user.click(within(row).getByRole('button', { name: /eliminar/i }))

    await waitFor(() => {
      expect(screen.queryByText('Soja')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Trigo')).toBeInTheDocument()
  })
})
