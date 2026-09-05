import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { toast } from 'sonner'

import LoteList from '@/features/lotes/components/LoteList'
import { loteHandlers, resetLoteMocks } from '@/features/lotes/mocks/loteHandlers'
import { apiBaseUrl } from '@/services/apiUrl'

const server = setupServer(...loteHandlers)
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

beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }

  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  resetLoteMocks()
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

const lotes = [
  {
    id: 1,
    nombre: 'Lote Uno',
    nombre_estancia: 'Estancia Uno',
    estancia_id: 1,
    lat: null,
    long: null,
    link_mapa: null,
    hectareas: 10,
  },
  {
    id: 2,
    nombre: 'Lote Dos',
    nombre_estancia: 'Estancia Dos',
    estancia_id: 2,
    lat: null,
    long: null,
    link_mapa: null,
    hectareas: 25,
  },
]

const renderList = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <LoteList lotes={lotes} onShow={() => {}} onDelete={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const openAdjuntosDialog = async (user, index = 0) => {
  await user.click(screen.getAllByRole('button', { name: /adjuntos/i })[index])
  return await screen.findByRole('dialog')
}

describe('LoteAdjuntosDialog', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('opens the dialog with the lote adjuntos list', async () => {
    renderList()

    const dialog = await openAdjuntosDialog(user)
    expect(within(dialog).getByText('plano-lote-uno.png')).toBeInTheDocument()
    expect(within(dialog).getByText('analisis-lote-uno.pdf')).toBeInTheDocument()
  })

  it('shows an empty state with the upload input when there are no adjuntos', async () => {
    renderList()

    const dialog = await openAdjuntosDialog(user, 1)
    expect(within(dialog).getByText('Sin adjuntos')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Nuevo plano o imagen')).toBeInTheDocument()
  })

  it('disables only the adjunto delete button whose mutation is pending', async () => {
    server.use(
      http.delete(`${API_URL}/lotes/:loteId/adjuntos/:adjuntoId`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({ lote_id: '1', adjunto_id: '101', ok: true })
      }),
    )
    renderList()

    const dialog = await openAdjuntosDialog(user)
    const deleteButtons = within(dialog).getAllByRole('button', { name: /eliminar/i })
    await user.click(deleteButtons[0])

    expect(within(dialog).getByRole('button', { name: /cargando/i })).toBeDisabled()
    expect(deleteButtons[1]).toBeEnabled()
    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Eliminando adjunto...',
        success: 'Adjunto eliminado',
        error: 'Hubo un error',
      }),
    )

    await waitFor(() => {
      expect(within(dialog).getAllByRole('button', { name: /eliminar/i })[0]).toBeEnabled()
    })
  })

  it('uploads a new file with toast feedback', async () => {
    renderList()

    const dialog = await openAdjuntosDialog(user)
    const file = new File(['plano'], 'nuevo-plano.png', { type: 'image/png' })
    await user.upload(within(dialog).getByLabelText('Nuevo plano o imagen'), file)
    await user.click(within(dialog).getByRole('button', { name: /subir/i }))

    expect(toast.promise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Subiendo adjunto...',
        success: 'Adjunto subido',
        error: 'Hubo un error',
      }),
    )

    await waitFor(() => {
      expect(within(dialog).getByRole('button', { name: /subir/i })).toBeDisabled()
    })
  })

  it('closes the dialog when clicking Cerrar', async () => {
    renderList()

    const dialog = await openAdjuntosDialog(user)
    expect(within(dialog).getByText('plano-lote-uno.png')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /cerrar/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
