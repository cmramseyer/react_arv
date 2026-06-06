import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MaquinistaForm from '@/components/MaquinistaForm'


function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

import { setupServer } from 'msw/node'
import { maquinistaHandlers } from '@/features/maquinistas/mocks/maquinistaHandlers'
 
export const server = setupServer(...maquinistaHandlers)

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
  })
})
