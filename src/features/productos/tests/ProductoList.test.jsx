import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ProductoList from '../components/ProductoList'

import { setupServer } from 'msw/node'
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

let user

describe('ProductoList', () => {
  beforeEach(() => {
    user = userEvent.setup()
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
  it.skip('deletes product', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <ProductoList />
      </MemoryRouter>
    )

    await screen.findByText('Roundup')
    await screen.findByText('2-4D')
    await screen.findByText('litros')
    await screen.findByText('kg')

    const roundupCell = await screen.findByText("Roundup")
    const row = roundupCell.closest("tr")
    await user.click(within(row).getByRole("button", { name: /eliminar/i }))

    expect(screen.getByRole('columnheader', { name: 'Tipo' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Unidad' })).toBeInTheDocument()
  })

})
