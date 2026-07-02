import React from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { AdjuntosList } from '@/features/lotes/components/AdjuntosList'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { setupServer } from 'msw/node'
import { loteHandlers } from '@/features/lotes/mocks/loteHandlers'
 
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

    const closeButton = within(dialog).getByRole("button", { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  })
  it('open delete modal, click No', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <AdjuntosList loteId={'1'} />
      </MemoryRouter>
    )


    const deleteButton = await screen.findAllByRole("button", { name: /eliminar/i });
    await user.click(deleteButton[0]);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });

    const noButton = await screen.findByRole("button", { name: "No" })
    user.click(noButton)

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

  })

  // add request spy or request recorder
  it('open delete modal, click Si', async () => {

    renderWithQueryClient(
      <MemoryRouter>
        <AdjuntosList loteId={'1'} />
      </MemoryRouter>
    )


    const deleteButton = await screen.findAllByRole("button", { name: /eliminar/i });
    await user.click(deleteButton[0]);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });

    const siButton = await screen.findByRole("button", { name: "Sí" })
    user.click(siButton)

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

  })
})
