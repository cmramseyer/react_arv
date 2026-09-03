import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ordenFumigacionHandlers, resetOrdenFumigacionMocks } from '@/features/ordenes-fumigacion/mocks/ordenFumigacionHandlers'
import { maquinistaHandlers, resetMaquinistaMocks } from '@/features/maquinistas/mocks/maquinistaHandlers'

const markerjsState = vi.hoisted(() => ({
  rasterize: vi.fn(),
  markerAreaInstances: [],
}))

vi.mock('@markerjs/markerjs3', () => ({
  FreehandMarker: class FreehandMarker {
    static typeName = 'FreehandMarker'
  },
  HighlighterMarker: class HighlighterMarker {
    static typeName = 'HighlighterMarker'
  },
  TextMarker: class TextMarker {
    static typeName = 'TextMarker'
  },
  MarkerArea: vi.fn().mockImplementation(() => {
    const element = document.createElement('div')
    element.addEventListener = vi.fn()
    element.removeEventListener = vi.fn()
    element.createMarker = vi.fn().mockReturnValue({
      strokeColor: '#ffeb3b',
      strokeWidth: 10,
      opacity: 0.33,
    })
    element.undo = vi.fn()
    element.redo = vi.fn()
    element.switchToSelectMode = vi.fn()
    element.deleteSelectedMarkers = vi.fn()
    element.getState = vi.fn().mockReturnValue({ version: 3, markers: [] })
    element.isUndoPossible = true
    element.isRedoPossible = true
    element.selectedMarkerEditors = []
    element.currentMarkerEditor = null
    markerjsState.markerAreaInstances.push(element)
    return element
  }),
  Renderer: vi.fn().mockImplementation(() => ({
    rasterize: markerjsState.rasterize,
  })),
}))

vi.mock('react-cropper', () => ({
  __esModule: true,
  default: (() => {
    const MockCropper = React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        cropper: {
          getCroppedCanvas: () => ({
            toDataURL: () =>
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6K4n8AAAAASUVORK5CYII=',
          }),
        },
      }))
      return <div data-testid="cropper" />
    })
    MockCropper.displayName = 'MockCropper'
    return MockCropper
  })(),
}))

vi.mock('cropperjs/dist/cropper.css', () => ({}))

import OrdenFumigacionShow from '@/features/ordenes-fumigacion/pages/OrdenFumigacionShow'
import { apiBaseUrl } from '@/services/apiUrl'

const server = setupServer(...ordenFumigacionHandlers, ...maquinistaHandlers)
const API_URL = apiBaseUrl

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetOrdenFumigacionMocks()
  resetMaquinistaMocks()
})
afterAll(() => server.close())

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithQueryClient = (ui) => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TooltipProvider>
        {ui}
      </TooltipProvider>
    </QueryClientProvider>
  )
}

const ordenFixture = {
  id: 1,
  nombre_estancia: 'Estancia Uno',
  nombre_lote: 'Lote Uno',
  estado_orden: 'pendiente',
  hectareas: 10,
  created_at_locale: '01/01/2025',
  creator: 'Tester',
  sensible: false,
  comentarios: '',
  cultivo: { nombre: 'Trigo' },
  lotes: [],
  facturas: [],
  maquinista: { nombre: 'Pedro' },
  fecha_trabajo_ddmmyyyy: '01/01/2025',
  datos_clima: '',
  info_trabajo: '',
  orden_url: null,
  orden_pdf_fecha_creacion: null,
}

const adjuntoFixture = {
  id: 101,
  filename: 'plano-lote.png',
  url: 'http://localhost:3000/uploads/plano-lote.png',
}

const OriginalImage = globalThis.Image
const originalAlert = globalThis.alert
const originalCreateObjectURL = globalThis.URL?.createObjectURL
const originalRevokeObjectURL = globalThis.URL?.revokeObjectURL

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

const useOrdenWithAdjuntoHandlers = (handlers = []) => {
  server.resetHandlers(
    ...handlers,
    http.get(`${API_URL}/ordenes_fumigacion/:id`, () => {
      return HttpResponse.json({ ...ordenFixture, adjuntos: [adjuntoFixture] })
    }),
    http.get(`${API_URL}/adjuntos`, () => {
      return HttpResponse.json([adjuntoFixture])
    }),
    http.get(adjuntoFixture.url, () => {
      return new HttpResponse('contenido', {
        headers: { 'Content-Type': 'image/png' },
      })
    }),
    ...maquinistaHandlers
  )
}

describe('OrdenFumigacionShow with MSW', () => {
  it('renders an active order without adjuntos', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion/1']}>
        <Routes>
          <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
        </Routes>
      </MemoryRouter>
    )

    expect((await screen.findAllByText(/#1/)).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Estancia Uno').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Activa').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Lote Uno/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/10 ha/).length).toBeGreaterThan(0)

    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /terminar/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /borrar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generar pdf/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /ver pdf/i })).not.toBeInTheDocument()
  })
})

describe('OrdenFumigacionShow', () => {
  let user

  beforeEach(() => {
    const MockImage = class MockImage {
      constructor() {
        this.naturalWidth = 800
        this.naturalHeight = 600
      }

      set src(value) {
        this._src = value
        if (this.onload) {
          this.onload()
        }
      }

      get src() {
        return this._src
      }
    }
    globalThis.Image = MockImage
    if (typeof window !== 'undefined') {
      window.Image = MockImage
    }

    if (globalThis.URL) {
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
      globalThis.URL.revokeObjectURL = vi.fn()
    }
    globalThis.alert = vi.fn()
    if (typeof window !== 'undefined') {
      window.alert = globalThis.alert
    }

    user = userEvent.setup()
    vi.clearAllMocks()
    markerjsState.rasterize.mockResolvedValue('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6K4n8AAAAASUVORK5CYII=')
    markerjsState.markerAreaInstances.splice(0)
  })

  afterEach(() => {
    globalThis.Image = OriginalImage
    if (typeof window !== 'undefined') {
      window.Image = OriginalImage
    }
    if (globalThis.URL) {
      globalThis.URL.createObjectURL = originalCreateObjectURL
      globalThis.URL.revokeObjectURL = originalRevokeObjectURL
    }
    globalThis.alert = originalAlert
    if (typeof window !== 'undefined') {
      window.alert = originalAlert
    }
  })

  it('returns to Ordenes without extra requests when clicking Volver', async () => {
    let getOrdenRequests = 0
    let getAdjuntosRequests = 0
    let imprimirRequests = 0
    let deleteRequests = 0

    server.resetHandlers(
      http.get(`${API_URL}/ordenes_fumigacion/:id`, () => {
        getOrdenRequests += 1
        return HttpResponse.json(ordenFixture)
      }),
      http.get(`${API_URL}/adjuntos`, () => {
        getAdjuntosRequests += 1
        return HttpResponse.json([])
      }),
      http.get(`${API_URL}/ordenes_fumigacion/:id/pdf`, () => {
        imprimirRequests += 1
        return HttpResponse.json({ orden_url: null, orden_pdf_fecha_creacion: null })
      }),
      http.delete(`${API_URL}/ordenes_fumigacion/:id`, () => {
        deleteRequests += 1
        return new HttpResponse(null, { status: 204 })
      }),
      ...maquinistaHandlers
    )

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion', '/ordenes_fumigacion/1']} initialIndex={1}>
        <Routes>
          <Route path="/ordenes_fumigacion" element={<div>Ordenes Page</div>} />
          <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    const ordenLabels = await screen.findAllByText('Orden #1')
    expect(ordenLabels.length).toBeGreaterThan(0)

    const getOrdenRequestCount = getOrdenRequests

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    await waitFor(() => {
      expect(getOrdenRequests).toBe(getOrdenRequestCount)
    })
    expect(deleteRequests).toBe(0)
    expect(imprimirRequests).toBe(0)
    expect(getAdjuntosRequests).toBe(0)
  })

  it('edits an adjunto image and starts saving it as adjunto', async () => {
    const fixedDate = new Date(2026, 9, 10, 19, 7, 1)
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(fixedDate.getTime())
    let getAdjuntosRequests = 0
    let uploadedOrdenId = null

    try {
      useOrdenWithAdjuntoHandlers([
        http.get(`${API_URL}/adjuntos`, () => {
          getAdjuntosRequests += 1
          return HttpResponse.json([adjuntoFixture])
        }),
        http.patch(`${API_URL}/ordenes_fumigacion/:id`, ({ params }) => {
          uploadedOrdenId = params.id
          return HttpResponse.json({ ...ordenFixture, adjuntos: [adjuntoFixture] })
        })
      ])

      renderWithQueryClient(
        <MemoryRouter initialEntries={['/ordenes_fumigacion/1']}>
          <Routes>
            <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
          </Routes>
        </MemoryRouter>
      )

      const ordenLabels = await screen.findAllByText('Orden #1')
      expect(ordenLabels.length).toBeGreaterThan(0)

      await user.click(screen.getByRole('button', { name: /generar pdf/i }))

      const adjuntoName = await screen.findByText('plano-lote.png')
      const actionsContainer = adjuntoName.closest('div')
      expect(actionsContainer).not.toBeNull()

      await user.click(within(actionsContainer).getByRole('button', { name: /^editar$/i }))

      const dialogs = await screen.findAllByRole('dialog')
      const editDialog = dialogs.find((dialog) => within(dialog).queryByText('Editar adjunto'))
      expect(editDialog).toBeTruthy()

      const saveButton = within(editDialog).getByRole('button', { name: /guardar/i })

      await waitFor(() => {
        expect(saveButton).toBeEnabled()
      })

      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(markerjsState.rasterize).toHaveBeenCalledTimes(1)
      })

      expect(globalThis.alert).not.toHaveBeenCalled()
      expect(getAdjuntosRequests).toBeGreaterThan(0)
      expect(
        uploadedOrdenId === '1' ||
          within(editDialog).queryByRole('button', { name: /guardando/i })
      ).toBeTruthy()
    } finally {
      dateNowSpy.mockRestore()
    }
  })

  it('shows contextual marker controls based on active tool', async () => {
    useOrdenWithAdjuntoHandlers()

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion/1']}>
        <Routes>
          <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
        </Routes>
      </MemoryRouter>
    )

    const ordenLabels = await screen.findAllByText('Orden #1')
    expect(ordenLabels.length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: /generar pdf/i }))
    await user.click(screen.getByRole('button', { name: /^editar$/i }))

    const dialogs = await screen.findAllByRole('dialog')
    const editDialog = dialogs.find((dialog) => within(dialog).queryByText('Editar adjunto'))
    expect(editDialog).toBeTruthy()

    await waitFor(() => {
      expect(within(editDialog).getByRole('button', { name: /guardar/i })).toBeEnabled()
    })

    await user.click(within(editDialog).getByRole('button', { name: /resaltador/i }))

    expect(within(editDialog).getByLabelText('Grosor del marcador')).toBeInTheDocument()
    expect(within(editDialog).queryByLabelText('Opacidad del marcador')).not.toBeInTheDocument()
    expect(within(editDialog).queryByLabelText('Fuente del texto')).not.toBeInTheDocument()
    expect(within(editDialog).queryByLabelText('Tamano de fuente')).not.toBeInTheDocument()

    await user.click(within(editDialog).getByRole('button', { name: /texto/i }))

    expect(within(editDialog).getByLabelText('Fuente del texto')).toBeInTheDocument()
    expect(within(editDialog).getByLabelText('Tamano de fuente')).toBeInTheDocument()
    expect(within(editDialog).queryByLabelText('Opacidad del marcador')).not.toBeInTheDocument()
    expect(within(editDialog).queryByLabelText('Grosor del marcador')).not.toBeInTheDocument()

    await user.click(within(editDialog).getByRole('button', { name: /recortar/i }))
    await within(editDialog).findByRole('button', { name: /aplicar recorte/i })

    const cancelButtons = within(editDialog).getAllByRole('button', { name: /cancelar/i })
    await user.click(cancelButtons[cancelButtons.length - 1])
  })

  it('triggers undo and redo from icon toolbar', async () => {
    useOrdenWithAdjuntoHandlers()

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion/1']}>
        <Routes>
          <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findAllByText('Orden #1')
    await user.click(screen.getByRole('button', { name: /generar pdf/i }))
    await user.click(screen.getByRole('button', { name: /^editar$/i }))

    const dialogs = await screen.findAllByRole('dialog')
    const editDialog = dialogs.find((dialog) => within(dialog).queryByText('Editar adjunto'))
    expect(editDialog).toBeTruthy()

    await waitFor(() => {
      expect(within(editDialog).getByRole('button', { name: /guardar/i })).toBeEnabled()
    })

    const markerArea = markerjsState.markerAreaInstances.at(-1)
    expect(markerArea).toBeTruthy()

    await user.click(within(editDialog).getByRole('button', { name: /deshacer/i }))
    await user.click(within(editDialog).getByRole('button', { name: /rehacer/i }))

    expect(markerArea.undo).toHaveBeenCalledTimes(1)
    expect(markerArea.redo).toHaveBeenCalledTimes(1)

    const cancelButtons = within(editDialog).getAllByRole('button', { name: /cancelar/i })
    await user.click(cancelButtons[cancelButtons.length - 1])
  })

  it('keeps independent presets for highlighter, freehand and text styles', async () => {
    useOrdenWithAdjuntoHandlers()

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/ordenes_fumigacion/1']}>
        <Routes>
          <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findAllByText('Orden #1')
    await user.click(screen.getByRole('button', { name: /generar pdf/i }))
    await user.click(screen.getByRole('button', { name: /^editar$/i }))

    const dialogs = await screen.findAllByRole('dialog')
    const editDialog = dialogs.find((dialog) => within(dialog).queryByText('Editar adjunto'))
    expect(editDialog).toBeTruthy()

    await waitFor(() => {
      expect(within(editDialog).getByRole('button', { name: /guardar/i })).toBeEnabled()
    })

    await user.click(within(editDialog).getByRole('button', { name: /resaltador/i }))

    fireEvent.change(within(editDialog).getByLabelText('Grosor del marcador'), {
      target: { value: '14' },
    })

    await user.click(within(editDialog).getByRole('button', { name: /abrir selector de color/i }))
    fireEvent.change(within(editDialog).getByLabelText('Color personalizado'), {
      target: { value: '#ff0000' },
    })

    await user.click(within(editDialog).getByRole('button', { name: /dibujo libre/i }))

    fireEvent.change(within(editDialog).getByLabelText('Grosor del marcador'), {
      target: { value: '6' },
    })

    if (!within(editDialog).queryByLabelText('Color personalizado')) {
      await user.click(within(editDialog).getByRole('button', { name: /abrir selector de color/i }))
    }
    fireEvent.change(within(editDialog).getByLabelText('Color personalizado'), {
      target: { value: '#00ff00' },
    })

    await user.click(within(editDialog).getByRole('button', { name: /texto/i }))

    if (!within(editDialog).queryByLabelText('Color personalizado')) {
      await user.click(within(editDialog).getByRole('button', { name: /abrir selector de color/i }))
    }
    fireEvent.change(within(editDialog).getByLabelText('Color personalizado'), {
      target: { value: '#0000ff' },
    })

    await user.click(within(editDialog).getByRole('button', { name: /resaltador/i }))

    expect(within(editDialog).getByLabelText('Grosor del marcador')).toHaveValue('14')
    expect(within(editDialog).queryByLabelText('Opacidad del marcador')).not.toBeInTheDocument()
    expect(within(editDialog).getByLabelText('Color personalizado')).toHaveValue('#ff0000')

    await user.click(within(editDialog).getByRole('button', { name: /dibujo libre/i }))

    expect(within(editDialog).getByLabelText('Grosor del marcador')).toHaveValue('6')
    expect(within(editDialog).getByLabelText('Color personalizado')).toHaveValue('#00ff00')

    const cancelButtons = within(editDialog).getAllByRole('button', { name: /cancelar/i })
    await user.click(cancelButtons[cancelButtons.length - 1])
  })
})
