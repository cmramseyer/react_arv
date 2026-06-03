import React from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
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

let user

describe('Adjuntos list', () => {

  beforeEach(()=> {
    user = userEvent.setup()
  })

  it('renders adjuntos', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <AdjuntosList loteId={'1'} />
      </MemoryRouter>
    )

    const image = await screen.findByRole('img', { name: /adjunto/i })
    expect(image).toHaveAttribute("src", expect.stringContaining("localhost:3000/uploads/plano-lote-uno.png"));
  })

  it('open modal to display image', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <AdjuntosList loteId={'1'} />
      </MemoryRouter>
    )

    const images = await screen.findAllByRole('img', { name: /adjunto/i })

    await user.click(images[0])
    expect(await screen.getByText("Imagen")).toBeInTheDocument()
  })

  it('open modal, display image, close modal', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <AdjuntosList loteId={'1'} />
      </MemoryRouter>
    )

    const images = await screen.findAllByRole('img', { name: /adjunto/i })

    await user.click(images[0])
    expect(await screen.getByText("Imagen")).toBeInTheDocument()

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const closeButton = within(dialog).getByRole("button", { name: /cerrar/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  })
})
