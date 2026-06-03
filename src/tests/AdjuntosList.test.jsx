import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { AdjuntosList } from '@/components/AdjuntosList'


import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { setupServer } from 'msw/node'
import { loteHandlers } from '@/mocks/loteHandlers'
 
export const server = setupServer(...loteHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (ui, queryClient = createQueryClient()) => {
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  };
};

describe('Adjuntos list', () => {

  it('renders adjuntos', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <AdjuntosList loteId={'1'} />
      </MemoryRouter>
    )

    const image = await screen.findByRole('img', { name: /adjunto/i })
    expect(image).toHaveAttribute("src", expect.stringContaining("localhost:3000/uploads/plano-lote-uno.png"));
  })

})
