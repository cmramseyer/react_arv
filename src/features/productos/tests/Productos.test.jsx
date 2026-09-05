import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { toast } from 'sonner'

import Productos from '@/features/productos/pages/Productos'
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

const renderProductos = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/productos']}>
        <Routes>
          <Route path="/productos" element={<Productos />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Productos list', () => {
  it('shows a skeleton while products are loading', async () => {
    server.use(
      http.get(`${API_URL}/productos`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json([])
      }),
    )

    renderProductos()

    expect(screen.getByRole('status', { name: /cargando productos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear producto/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /cargando productos/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText('No hay productos')).toBeInTheDocument()
  })

  it('renders products after loading', async () => {
    renderProductos()

    expect(await screen.findByText('Roundup')).toBeInTheDocument()
    expect(screen.getByText('2-4D')).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: /cargando productos/i })).not.toBeInTheDocument()
  })

  it('disables only the delete button whose mutation is pending', async () => {
    const user = userEvent.setup()
    server.use(
      http.delete(`${API_URL}/productos/:id`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderProductos()
    await screen.findByText('Roundup')

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(deleteButtons[0])

    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled()
    expect(deleteButtons[1]).toBeEnabled()
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Eliminando producto...',
        success: 'Producto eliminado',
        error: 'Hubo un error',
      }),
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /eliminar/i })[0]).toBeEnabled()
    })
  })
})
