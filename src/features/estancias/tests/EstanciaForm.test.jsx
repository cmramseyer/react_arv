import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EstanciaForm from '@/components/EstanciaForm'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

import { setupServer } from 'msw/node'
import { estanciaHandlers } from '@/mocks/estanciaHandlers'
 
export const server = setupServer(...estanciaHandlers)

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

describe('EstanciaForm', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('Edit mode', () => {

    it('renders form data', async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <EstanciaForm formAction="edit" estanciaId="1" />
        </MemoryRouter>
      )

      await screen.findByDisplayValue("Estancia Uno");
      await screen.findByDisplayValue("Contacto Uno");
      await screen.findByDisplayValue("12345678");
      await screen.findByDisplayValue("estancia@uno.com");
      expect(screen.getByRole("button", { name: /actualizar/i })).toBeInTheDocument();

    })
  })
  describe('Create mode', () => {

    it('validates form data', async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <EstanciaForm formAction="create" />
        </MemoryRouter>
      )

      await user.click(screen.getByRole("button", { name: /grabar/i }));

      expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument()
      expect(await screen.findByText('El contacto es requerido')).toBeInTheDocument()
      expect(await screen.findByText('El telefono es requerido')).toBeInTheDocument()
      expect(await screen.findByText('El email es requerido')).toBeInTheDocument()
    })
  })

})
