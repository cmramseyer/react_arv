import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { toast } from 'sonner'

import ProductoEdit from '@/features/productos/pages/ProductoEdit'
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

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

const renderProductoEdit = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/productos/1/edit']}>
        <Routes>
          <Route path="/productos" element={<div>Productos Page</div>} />
          <Route path="/productos/:id/edit" element={<ProductoEdit />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProductoEdit', () => {
  it('renders page title and product data', async () => {
    renderProductoEdit()

    expect(screen.getByRole('heading', { name: /editar producto/i })).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Roundup')).toBeInTheDocument()
  })

  it('updates a product and returns to Productos', async () => {
    const user = userEvent.setup()
    renderProductoEdit()

    const nombreInput = await screen.findByDisplayValue('Roundup')
    await user.clear(nombreInput)
    await user.type(nombreInput, 'Roundup actualizado')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/productos')
    })
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Actualizando producto...',
        success: 'Producto actualizado',
        error: 'Hubo un error',
      }),
    )
  })

  it('stays on the edit page and keeps form values when the update fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch(`${API_URL}/productos/:id`, () => {
        return HttpResponse.json({ error: 'Error updating producto' }, { status: 500 })
      }),
    )
    renderProductoEdit()

    const nombreInput = await screen.findByDisplayValue('Roundup')
    await user.clear(nombreInput)
    await user.type(nombreInput, 'Cambio que falla')
    await user.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/productos/1/edit')
    expect(screen.getByDisplayValue('Cambio que falla')).toBeInTheDocument()
  })
})
