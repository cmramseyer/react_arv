import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { vi } from 'vitest'

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

vi.mock('../services/ordenesFumigacionService', () => ({
  getOrdenFumigacion: vi.fn(),
  deleteOrdenFumigacion: vi.fn(),
  imprimirOrdenFumigacion: vi.fn(),
  getAdjuntosOrden: vi.fn(),
  updateAdjuntoOrdenFumigacion: vi.fn(),
}))

vi.mock('../services/fetchWithAuth', () => ({
  fetchWithAuth: vi.fn(),
}))

import {
  getOrdenFumigacion,
  deleteOrdenFumigacion,
  imprimirOrdenFumigacion,
  getAdjuntosOrden,
  updateAdjuntoOrdenFumigacion,
} from '../services/ordenesFumigacionService'
import { fetchWithAuth } from '../services/fetchWithAuth'
import OrdenFumigacionShow from './OrdenFumigacionShow'

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
const originalCreateObjectURL = globalThis.URL?.createObjectURL
const originalRevokeObjectURL = globalThis.URL?.revokeObjectURL

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

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

    user = userEvent.setup()
    vi.clearAllMocks()
    markerjsState.rasterize.mockResolvedValue('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6K4n8AAAAASUVORK5CYII=')
    markerjsState.markerAreaInstances.splice(0)
    fetchWithAuth.mockResolvedValueOnce({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(['contenido'], { type: 'image/png' })),
    })
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
  })

  it('returns to Ordenes without extra requests when clicking Volver', async () => {
    getOrdenFumigacion.mockResolvedValueOnce(ordenFixture)
    render(
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

    const getOrdenCalls = getOrdenFumigacion.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/ordenes_fumigacion')
    expect(deleteOrdenFumigacion).not.toHaveBeenCalled()
    expect(imprimirOrdenFumigacion).not.toHaveBeenCalled()
    expect(getAdjuntosOrden).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(getOrdenFumigacion).toHaveBeenCalledTimes(getOrdenCalls)
    })
  })

  it('edits an adjunto image and uploads it as adjunto', async () => {
    getOrdenFumigacion
      .mockResolvedValueOnce(ordenFixture)
      .mockResolvedValueOnce({ ...ordenFixture, adjuntos: [adjuntoFixture] })
    getAdjuntosOrden.mockResolvedValueOnce([adjuntoFixture])
    updateAdjuntoOrdenFumigacion.mockResolvedValueOnce()

    render(
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

    await user.click(saveButton)

    await waitFor(() => {
      expect(updateAdjuntoOrdenFumigacion).toHaveBeenCalledTimes(1)
    })

    const [ordenIdArg, fileArg] = updateAdjuntoOrdenFumigacion.mock.lastCall
    expect(ordenIdArg).toBe('1')
    expect(fileArg).toBeInstanceOf(File)
    expect(fileArg.name).toContain('plano-lote-editado')

    expect(getAdjuntosOrden).toHaveBeenCalledTimes(1)
  })

  it('shows contextual marker controls based on active tool', async () => {
    getOrdenFumigacion
      .mockResolvedValueOnce(ordenFixture)
      .mockResolvedValueOnce({ ...ordenFixture, adjuntos: [adjuntoFixture] })
    getAdjuntosOrden.mockResolvedValueOnce([adjuntoFixture])

    render(
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

    await user.click(within(editDialog).getByRole('button', { name: /cancelar/i }))
  })

  it('triggers undo and redo from icon toolbar', async () => {
    getOrdenFumigacion
      .mockResolvedValueOnce(ordenFixture)
      .mockResolvedValueOnce({ ...ordenFixture, adjuntos: [adjuntoFixture] })
    getAdjuntosOrden.mockResolvedValueOnce([adjuntoFixture])

    render(
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

    await user.click(within(editDialog).getByRole('button', { name: /cancelar/i }))
  })

  it('keeps independent presets for highlighter, freehand and text styles', async () => {
    getOrdenFumigacion
      .mockResolvedValueOnce(ordenFixture)
      .mockResolvedValueOnce({ ...ordenFixture, adjuntos: [adjuntoFixture] })
    getAdjuntosOrden.mockResolvedValueOnce([adjuntoFixture])

    render(
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

    await user.click(within(editDialog).getByRole('button', { name: /cancelar/i }))
  })
})
