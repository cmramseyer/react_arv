import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MaquinistaForm from '@/features/maquinistas/components/MaquinistaForm'

import { setupServer } from 'msw/node'
import { maquinistaHandlers, resetMaquinistaMocks } from '@/features/maquinistas/mocks/maquinistaHandlers'
 
export const server = setupServer(...maquinistaHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetMaquinistaMocks();
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

describe('MaquinistaForm', () => {
  let user
  beforeEach(() => {
    user = userEvent.setup()
  })
  describe('Edit mode', () => {
    it("returns to Maquinistas without extra requests when clicking Volver", async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <MaquinistaForm formAction="edit" id="1" />
        </MemoryRouter>,
      );

      await screen.findByDisplayValue("Carlos");
      expect(screen.getByRole("button", { name: /actualizar/i })).toBeInTheDocument();
    });

    it('updates a maquinista and navigates to maquinistas page', async () => {
      renderWithQueryClient(
        <MemoryRouter initialEntries={['/maquinistas/1/edit']}>
          <Routes>
            <Route path="/maquinistas/1/edit" element={<MaquinistaForm formAction="edit" id="1" />} />
            <Route path="/maquinistas" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>,
      );

      const nombreInput = await screen.findByDisplayValue('Carlos');
      await user.clear(nombreInput);
      await user.type(nombreInput, 'Carlos actualizado');
      await user.click(screen.getByRole('button', { name: /actualizar/i }));

      expect(await screen.findByTestId('location')).toHaveTextContent('/maquinistas');
    });
  })
  describe('Create mode', () => {
    it("validates form", async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <MaquinistaForm formAction="create" />
        </MemoryRouter>,
      );

      expect(screen.getByRole("button", { name: /grabar/i })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /grabar/i }));

      expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument()
    });

    it('creates a maquinista and navigates to maquinistas page', async () => {
      renderWithQueryClient(
        <MemoryRouter initialEntries={['/maquinistas/new']}>
          <Routes>
            <Route path="/maquinistas/new" element={<MaquinistaForm formAction="create" />} />
            <Route path="/maquinistas" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText(/nombre/i), 'Pedro');
      await user.click(screen.getByRole('button', { name: /grabar/i }));

      expect(await screen.findByTestId('location')).toHaveTextContent('/maquinistas');
    });
  })
})
