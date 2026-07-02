import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import CultivoForm from '@/features/cultivos/components/CultivoForm'

import { setupServer } from 'msw/node'
import { cultivoHandlers, resetCultivoMocks } from '@/features/cultivos/mocks/cultivoHandlers'
 
export const server = setupServer(...cultivoHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetCultivoMocks();
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

describe('CultivoForm', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('Edit mode', () => {
    it('renders cultivo edit form', async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <CultivoForm formAction="edit" id="1" />
        </MemoryRouter>
      )

      await screen.findByDisplayValue('Soja')

      expect(screen.getByRole("button", { name: /actualizar/i })).toBeInTheDocument();

    })

    it('updates a cultivo and navigates to cultivos page', async () => {
      renderWithQueryClient(
        <MemoryRouter initialEntries={['/cultivos/1/edit']}>
          <Routes>
            <Route path="/cultivos" element={<LocationDisplay />} />
            <Route path="/cultivos/:id/edit" element={<CultivoForm formAction="edit" id="1" />} />
          </Routes>
        </MemoryRouter>
      )

      const nombreInput = await screen.findByDisplayValue('Soja')
      await user.clear(nombreInput)
      await user.type(nombreInput, 'Maiz')
      await user.click(screen.getByRole("button", { name: /actualizar/i }))

      await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/cultivos')
      })
    })
  })

  describe('Create mode', () => {

    it('renders cultivo new form', async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <CultivoForm formAction="create" />
        </MemoryRouter>
      )

      expect(screen.getByRole("button", { name: /grabar/i })).toBeInTheDocument();

    })
    it('validates form data', async () => {
      renderWithQueryClient(
        <MemoryRouter>
          <CultivoForm formAction="create" />
        </MemoryRouter>
      )

      await user.click(screen.getByRole("button", { name: /grabar/i }));
      expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument()

    })

    it('creates a cultivo and navigates to cultivos page', async () => {
      renderWithQueryClient(
        <MemoryRouter initialEntries={['/cultivos/new']}>
          <Routes>
            <Route path="/cultivos" element={<LocationDisplay />} />
            <Route path="/cultivos/new" element={<CultivoForm formAction="create" />} />
          </Routes>
        </MemoryRouter>
      )

      await user.type(screen.getByRole('textbox', { name: /nombre/i }), 'Maiz')
      await user.click(screen.getByRole("button", { name: /grabar/i }))

      await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/cultivos')
      })
    })
  })

})
