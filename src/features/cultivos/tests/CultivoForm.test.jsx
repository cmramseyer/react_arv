import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import CultivoForm from '@/features/cultivos/components/CultivoForm'

import { setupServer } from 'msw/node'
import { cultivoHandlers } from '@/features/cultivos/mocks/cultivoHandlers'
 
export const server = setupServer(...cultivoHandlers)

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
  })

})
