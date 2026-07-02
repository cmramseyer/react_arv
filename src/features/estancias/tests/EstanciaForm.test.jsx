import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EstanciaForm from '@/features/estancias/components/EstanciaForm'

import { setupServer } from 'msw/node'
import { estanciaHandlers, resetEstanciaMocks } from '@/features/estancias/mocks/estanciaHandlers'
 
export const server = setupServer(...estanciaHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetEstanciaMocks();
});
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

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

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

    it('updates an estancia and navigates to estancias page', async () => {
      renderWithQueryClient(
        <MemoryRouter initialEntries={['/estancias/1/edit']}>
          <Routes>
            <Route path="/estancias" element={<LocationDisplay />} />
            <Route path="/estancias/:id/edit" element={<EstanciaForm formAction="edit" estanciaId="1" />} />
          </Routes>
        </MemoryRouter>
      )

      const nombreInput = await screen.findByDisplayValue('Estancia Uno')
      await user.clear(nombreInput)
      await user.type(nombreInput, 'Estancia Actualizada')
      await user.click(screen.getByRole("button", { name: /actualizar/i }))

      await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/estancias')
      })
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
      expect(screen.queryByText('El contacto es requerido')).not.toBeInTheDocument()
      expect(screen.queryByText('El telefono es requerido')).not.toBeInTheDocument()
      expect(screen.queryByText('El email es requerido')).not.toBeInTheDocument()
    })

    it('validates optional field format when present', async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <EstanciaForm formAction="create" />
        </MemoryRouter>
      )

      await user.type(screen.getByLabelText('Nombre'), 'Estancia nueva')
      await user.type(screen.getByLabelText('Telefono'), 'abc')
      await user.type(screen.getByLabelText('Email'), 'email-invalido')
      await user.click(screen.getByRole("button", { name: /grabar/i }));

      expect(await screen.findByText('El telefono debe ser numerico')).toBeInTheDocument()
      expect(await screen.findByText('El email no es valido')).toBeInTheDocument()
    })

    it('creates an estancia and navigates to estancias page', async () => {
      renderWithQueryClient(
        <MemoryRouter initialEntries={['/estancias/new']}>
          <Routes>
            <Route path="/estancias" element={<LocationDisplay />} />
            <Route path="/estancias/new" element={<EstanciaForm formAction="create" />} />
          </Routes>
        </MemoryRouter>
      )

      await user.type(screen.getByLabelText('Nombre'), 'Estancia Nueva')
      await user.type(screen.getByLabelText('Contacto'), 'Contacto Nuevo')
      await user.type(screen.getByLabelText('Telefono'), '123456789')
      await user.type(screen.getByLabelText('Email'), 'nueva@estancia.com')
      await user.click(screen.getByRole("button", { name: /grabar/i }))

      await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/estancias')
      })
    })
  })

})
