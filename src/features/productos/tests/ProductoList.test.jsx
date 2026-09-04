import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'

import ProductoList from '../components/ProductoList'

import { setupServer } from 'msw/node'

import { apiUrl } from '@/services/apiUrl'
import { productoHandlers, resetProductoMocks } from '@/features/productos/mocks/productoHandlers'
 
export const server = setupServer(...productoHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetProductoMocks();
});
afterAll(() => server.close());

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

let user

describe('ProductoList', () => {
  beforeEach(() => {
    user = userEvent.setup()
  })

  it('shows a skeleton while products are loading', async () => {
    server.use(
      http.get(apiUrl('productos'), async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json([])
      })
    )

    renderWithQueryClient(
      <MemoryRouter>
        <ProductoList />
      </MemoryRouter>
    )

    expect(screen.getByRole('status', { name: /cargando productos/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /cargando productos/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText('No hay productos')).toBeInTheDocument()
  })

  it('renders products in the table', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <ProductoList />
      </MemoryRouter>
    )

    await screen.findByText('Roundup')
    await screen.findByText('2-4D')
    await screen.findByText('litros')
    await screen.findByText('kg')

    expect(screen.getByRole('columnheader', { name: 'Tipo' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Unidad' })).toBeInTheDocument()
  })

  it('navigates to edit page when clicking edit', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/productos']}>
        <ProductoList />
        <LocationDisplay />
      </MemoryRouter>
    )

    const roundupCell = await screen.findByText('Roundup')
    const row = roundupCell.closest('tr')

    await user.click(within(row).getByRole('button', { name: /editar/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/productos/1/edit')
  })

  it('deletes product from the table', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <ProductoList />
      </MemoryRouter>
    )

    const roundupCell = await screen.findByText('Roundup')
    expect(screen.getByText('2-4D')).toBeInTheDocument()

    const row = roundupCell.closest('tr')
    await user.click(within(row).getByRole('button', { name: /eliminar/i }))

    await waitFor(() => {
      expect(screen.queryByText('Roundup')).not.toBeInTheDocument()
    })

    expect(screen.getByText('2-4D')).toBeInTheDocument()
  })

  it('shows an error message when products request fails', async () => {
    server.use(
      http.get(apiUrl('productos'), () => {
        return HttpResponse.json({ error: 'Error interno' }, { status: 500 })
      })
    )

    renderWithQueryClient(
      <MemoryRouter>
        <ProductoList />
      </MemoryRouter>
    )

    expect(await screen.findByText('Error: Error fetching productos')).toBeInTheDocument()
  })

})
