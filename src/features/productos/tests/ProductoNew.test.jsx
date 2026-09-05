import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { toast } from 'sonner'

import ProductoNew from '@/features/productos/pages/ProductoNew'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { productoHandlers, resetProductoMocks } from '@/features/productos/mocks/productoHandlers'
import { apiBaseUrl } from '@/services/apiUrl'

const server = setupServer(...productoHandlers)
const API_URL = apiBaseUrl

vi.mock('sonner', () => ({
  // Mimics real Sonner: with a loading message, toast.promise returns a
  // non-rejecting wrapper instead of the original promise, so awaiting it
  // never throws. Control flow must await the mutation promise itself.
  toast: {
    promise: vi.fn((promise) => {
      promise.catch(() => {})
      return { unwrap: () => promise }
    }),
  },
}))

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetProductoMocks()
  vi.clearAllMocks()
})
afterAll(() => server.close())

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithQueryClient = (ui, queryClient = createQueryClient()) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('ProductoNew', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders page title', () => {
    renderWithQueryClient(
      <MemoryRouter>
        <ProductoNew />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /nuevo producto/i })).toBeInTheDocument()
  })

  it('creates a product and returns to Productos', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/productos/new']}>
        <Routes>
          <Route path="/productos" element={<div>Productos Page</div>} />
          <Route path="/productos/new" element={<ProductoNew />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/nombre/i), 'Glifosato')
    await user.type(screen.getByLabelText(/tipo de producto/i), 'Agroquímico')
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Litros' }))
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/productos')
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Guardando producto...',
        success: 'Producto creado',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the new page and keeps form values when creation fails', async () => {
    server.use(
      http.post(`${API_URL}/productos`, () => {
        return HttpResponse.json({ error: 'Error creating producto' }, { status: 500 })
      }),
    )
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/productos/new']}>
        <Routes>
          <Route path="/productos" element={<div>Productos Page</div>} />
          <Route path="/productos/new" element={<ProductoNew />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/nombre/i), 'Producto Fallido')
    await user.type(screen.getByLabelText(/tipo de producto/i), 'Agroquímico')
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Litros' }))
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/productos/new')
    expect(screen.getByDisplayValue('Producto Fallido')).toBeInTheDocument()
  })
})
