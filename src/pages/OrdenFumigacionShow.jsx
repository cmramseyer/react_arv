import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getOrdenFumigacion,
  deleteOrdenFumigacion,
  imprimirOrdenFumigacion,
  getAdjuntosOrden,
  updateAdjuntoOrdenFumigacion,
} from '../services/ordenesFumigacionService'
import { fetchWithAuth } from '../services/fetchWithAuth'
import { HighlighterMarker, MarkerArea, Renderer, TextMarker } from '@markerjs/markerjs3'
import { Highlighter, SquareDashed, Type } from 'lucide-react'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import IconLabelBadge from '@/components/IconLabelBadge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import formatHectareas from '../utils/formatHectareas'

const PDF_FILENAME_REGEX = /\.pdf$/i
const DEFAULT_MARKER_COLOR = '#ffeb3b'
const DEFAULT_MARKER_OPACITY = 0.33
const DEFAULT_MARKER_WIDTH = 10
const DEFAULT_TEXT_VALUE = 'Texto'
const DEFAULT_TEXT_FONT_FAMILY = 'Helvetica, Arial, sans-serif'
const DEFAULT_TEXT_FONT_SIZE = 1
const DEFAULT_TEXT_FONT_STEP = 0.1
const DEFAULT_TEXT_FONT_UNITS = 'rem'
const TEXT_FONT_OPTIONS = [
  { label: 'Predeterminado', value: '' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: 'Times New Roman, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet', value: 'Trebuchet MS, sans-serif' },
  { label: 'Courier', value: 'Courier New, monospace' },
]

const normalizeAdjuntoId = (adjuntoId) => String(adjuntoId)

const getAdjuntoIdValue = (adjunto, index = 0) => {
  if (!adjunto) return `adjunto-${index + 1}`
  const idValue = adjunto.id ?? adjunto.attachment_id ?? adjunto.adjunto_id ?? adjunto.uuid
  if (idValue !== undefined && idValue !== null && idValue !== '') return idValue
  const urlValue = adjunto.url ?? adjunto.file_url ?? adjunto.archivo_url ?? adjunto.path
  if (urlValue) return urlValue
  const filenameValue = adjunto.filename ?? adjunto.name ?? adjunto.nombre
  if (filenameValue) return filenameValue
  return `adjunto-${index + 1}`
}

const normalizeAdjunto = (adjunto, index) => {
  const idValue = getAdjuntoIdValue(adjunto, index)
  return {
    ...adjunto,
    id: idValue,
    filename: adjunto?.filename ?? adjunto?.name ?? adjunto?.nombre ?? `Adjunto ${index + 1}`,
    url: adjunto?.url ?? adjunto?.file_url ?? adjunto?.archivo_url ?? adjunto?.path ?? '',
  }
}

const normalizeAdjuntosList = (adjuntos) =>
  Array.isArray(adjuntos) ? adjuntos.map(normalizeAdjunto) : []

const buildAdjuntoKey = (adjunto, index) =>
  normalizeAdjuntoId(getAdjuntoIdValue(adjunto, index))

const mergeAdjuntosLists = (primaryList, secondaryList) => {
  const merged = new Map()
  const addItem = (adjunto, index) => {
    const key = buildAdjuntoKey(adjunto, index)
    if (!key) return
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, adjunto)
      return
    }
    const incomingHasId = adjunto?.id !== undefined && adjunto?.id !== null && adjunto?.id !== ''
    const existingHasId = existing?.id !== undefined && existing?.id !== null && existing?.id !== ''
    if (incomingHasId && !existingHasId) {
      merged.set(key, adjunto)
    }
  }
  primaryList.forEach(addItem)
  secondaryList.forEach(addItem)
  return Array.from(merged.values())
}

const isPdfAdjunto = (adjunto) => {
  const filename = String(adjunto?.filename || '')
  const url = String(adjunto?.url || '')
  return PDF_FILENAME_REGEX.test(filename) || PDF_FILENAME_REGEX.test(url)
}

const isImageAdjunto = (adjunto) => !isPdfAdjunto(adjunto)

const buildEditedAdjuntoFilename = (originalFilename) => {
  const fallbackName = 'adjunto-editado.png'
  if (!originalFilename || typeof originalFilename !== 'string') return fallbackName
  const filenameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, '')
  if (!filenameWithoutExtension) return fallbackName
  return `${filenameWithoutExtension}-editado.png`
}

const dataUrlToFile = (dataUrl, filename) => {
  const [meta, base64String] = String(dataUrl || '').split(',')
  const mimeMatch = meta?.match(/data:(.*?);base64/)
  if (!base64String || !mimeMatch) {
    throw new Error('No se pudo convertir la imagen editada')
  }

  const mimeType = mimeMatch[1] || 'image/png'
  const binaryString = atob(base64String)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return new File([bytes], filename, { type: mimeType })
}


export default function OrdenFumigacionShow() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [orden, setOrden] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [fechaPdf, setFechaPdf] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adjuntos, setAdjuntos] = useState([])
  const [selectedAdjuntos, setSelectedAdjuntos] = useState(new Set())
  const [isLoadingAdjuntos, setIsLoadingAdjuntos] = useState(false)
  const [adjuntoEnEdicion, setAdjuntoEnEdicion] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [adjuntoEditando, setAdjuntoEditando] = useState(null)
  const [markerColor, setMarkerColor] = useState(DEFAULT_MARKER_COLOR)
  const [markerWidth, setMarkerWidth] = useState(DEFAULT_MARKER_WIDTH)
  const [markerOpacity, setMarkerOpacity] = useState(DEFAULT_MARKER_OPACITY)
  const [markerText, setMarkerText] = useState('')
  const [markerFontFamily, setMarkerFontFamily] = useState('')
  const [markerFontSize, setMarkerFontSize] = useState(DEFAULT_TEXT_FONT_SIZE)
  const [markerReady, setMarkerReady] = useState(false)
  const [markerError, setMarkerError] = useState('')
  const editDialogRootRef = useRef(null)
  const [markerAreaContainer, setMarkerAreaContainer] = useState(null)
  const markerAreaRef = useRef(null)
  const markerTargetImageRef = useRef(null)
  const markerObjectUrlRef = useRef(null)

  const updateAdjuntosState = (nextAdjuntos, { preserveSelection = false } = {}) => {
    setAdjuntos(nextAdjuntos)
    setSelectedAdjuntos((prevSelectedAdjuntos) => {
      if (!preserveSelection) {
        return new Set()
      }

      const availableIds = new Set(nextAdjuntos.map((adjunto) => normalizeAdjuntoId(adjunto.id)))
      const nextSelectedAdjuntos = new Set()

      prevSelectedAdjuntos.forEach((adjuntoId) => {
        const normalizedId = normalizeAdjuntoId(adjuntoId)
        if (availableIds.has(normalizedId)) {
          nextSelectedAdjuntos.add(normalizedId)
        }
      })

      return nextSelectedAdjuntos
    })
  }

  const applyOrdenResponse = (data, { preserveSelection = false } = {}) => {
    setOrden(data)
    setPdfUrl(data?.orden_url ?? null)
    setFechaPdf(data?.orden_pdf_fecha_creacion ?? null)

    const ordenAdjuntos = normalizeAdjuntosList(data?.adjuntos)
    if (ordenAdjuntos.length > 0) {
      updateAdjuntosState(ordenAdjuntos, { preserveSelection })
    } else if (!preserveSelection) {
      updateAdjuntosState([], { preserveSelection })
    }
  }

  useEffect(() => {
    getOrdenFumigacion(id).then((data) => {
      applyOrdenResponse(data)
    })
  }, [id])

  

  const handleEditar = () => {
    navigate(`/ordenes_fumigacion/${id}/editar`)
  }

  const handleTerminar = () => {
    navigate(`/ordenes_fumigacion/${id}/terminar`)
  }

  const handleBorrar = async () => {
    if (confirm('¿Seguro quieres borrar esta orden?')) {
      await deleteOrdenFumigacion(id)
      navigate('/ordenes_fumigacion')
    }
  }

  const fetchAdjuntos = async ({ preserveSelection = false } = {}) => {
    setIsLoadingAdjuntos(true)
    const ordenAdjuntos = normalizeAdjuntosList(orden?.adjuntos)
    if (ordenAdjuntos.length > 0) {
      updateAdjuntosState(ordenAdjuntos, { preserveSelection })
    }

    try {
      const data = await getAdjuntosOrden(id)
      const fetchedAdjuntos = normalizeAdjuntosList(data)
      const mergedAdjuntos = mergeAdjuntosLists(fetchedAdjuntos, ordenAdjuntos)
      updateAdjuntosState(mergedAdjuntos, { preserveSelection })
    } catch (error) {
      if (ordenAdjuntos.length === 0 && !preserveSelection) {
        updateAdjuntosState([], { preserveSelection })
      }
      console.error(error)
    } finally {
      setIsLoadingAdjuntos(false)
    }
  }

  const handleGenerarPdf = async () => {
    setIsDialogOpen(true)
    fetchAdjuntos()
  }

  const handleToggleAdjunto = (adjuntoId) => {
    const normalizedId = normalizeAdjuntoId(adjuntoId)
    setSelectedAdjuntos((prev) => {
      const next = new Set(prev)
      if (next.has(normalizedId)) {
        next.delete(normalizedId)
      } else {
        next.add(normalizedId)
      }
      return next
    })
  }

  const handleEditarAdjunto = (adjunto) => {
    if (!isImageAdjunto(adjunto)) {
      return
    }

    setAdjuntoEditando(adjunto)
    setMarkerReady(false)
    setMarkerError('')
    setIsEditDialogOpen(true)
  }

  const handleEditDialogChange = (open) => {
    setIsEditDialogOpen(open)
    if (!open) {
      setAdjuntoEditando(null)
      setMarkerReady(false)
      setMarkerError('')
    }
  }

  const isTextMarkerEditor = (markerEditor) =>
    markerEditor?.marker?.typeName === TextMarker.typeName

  const normalizeFontFamily = (fontFamily) =>
    fontFamily === DEFAULT_TEXT_FONT_FAMILY ? '' : fontFamily

  const buildFontSize = (value) => ({
    value,
    units: DEFAULT_TEXT_FONT_UNITS,
    step: DEFAULT_TEXT_FONT_STEP,
  })

  const applyTextToEditor = (markerEditor, text) => {
    if (!isTextMarkerEditor(markerEditor)) return
    markerEditor.marker.text = text
    if (typeof markerEditor.marker.setSize === 'function') {
      markerEditor.marker.setSize()
    }
  }

  const applyTextStyleToEditor = (markerEditor, overrides = {}) => {
    if (!isTextMarkerEditor(markerEditor)) return
    if (overrides.color !== undefined) {
      markerEditor.marker.color = overrides.color
    }
    if (overrides.opacity !== undefined) {
      markerEditor.marker.opacity = overrides.opacity
    }
    if (overrides.fontFamily !== undefined) {
      const nextFontFamily = overrides.fontFamily || DEFAULT_TEXT_FONT_FAMILY
      markerEditor.marker.fontFamily = nextFontFamily
    }
    if (overrides.fontSize !== undefined) {
      markerEditor.marker.fontSize = buildFontSize(overrides.fontSize)
    }
  }

  const applyMarkerSettings = (markerEditor, overrides = {}) => {
    if (!markerEditor) return
    const nextColor = overrides.color ?? markerColor
    const nextWidth = overrides.width ?? markerWidth
    const nextOpacity = overrides.opacity ?? markerOpacity
    if (isTextMarkerEditor(markerEditor)) {
      applyTextStyleToEditor(markerEditor, {
        color: overrides.color !== undefined ? nextColor : undefined,
        opacity: overrides.opacity !== undefined ? nextOpacity : undefined,
      })
      return
    }
    markerEditor.strokeColor = nextColor
    if (overrides.width !== undefined) {
      markerEditor.strokeWidth = nextWidth
    }
    markerEditor.opacity = nextOpacity
  }

  const applySettingsToSelection = (overrides = {}) => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const selectedEditors = markerArea.selectedMarkerEditors || []
    if (selectedEditors.length > 0) {
      selectedEditors.forEach((editor) => applyMarkerSettings(editor, overrides))
      return
    }
    if (markerArea.currentMarkerEditor) {
      applyMarkerSettings(markerArea.currentMarkerEditor, overrides)
    }
  }

  const applyTextToSelection = (text) => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const selectedEditors = markerArea.selectedMarkerEditors || []
    if (selectedEditors.length > 0) {
      selectedEditors.forEach((editor) => applyTextToEditor(editor, text))
      return
    }
    if (markerArea.currentMarkerEditor) {
      applyTextToEditor(markerArea.currentMarkerEditor, text)
    }
  }

  const applyTextStyleToSelection = (overrides = {}) => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const selectedEditors = markerArea.selectedMarkerEditors || []
    if (selectedEditors.length > 0) {
      selectedEditors.forEach((editor) => applyTextStyleToEditor(editor, overrides))
      return
    }
    if (markerArea.currentMarkerEditor) {
      applyTextStyleToEditor(markerArea.currentMarkerEditor, overrides)
    }
  }

  const handleCreateHighlighter = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const markerEditor = markerArea.createMarker(HighlighterMarker)
    if (markerEditor) {
      applyMarkerSettings(markerEditor)
    }
  }

  const handleCreateText = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const markerEditor = markerArea.createMarker(TextMarker)
    if (markerEditor) {
      const nextText = markerText.trim() === '' ? DEFAULT_TEXT_VALUE : markerText
      applyTextToEditor(markerEditor, nextText)
      applyTextStyleToEditor(markerEditor, {
        color: markerColor,
        opacity: markerOpacity,
        fontFamily: markerFontFamily,
        fontSize: markerFontSize,
      })
    }
  }

  const handleSelectMode = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    markerArea.switchToSelectMode()
  }

  const handleDeleteSelected = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    markerArea.deleteSelectedMarkers()
  }

  const handleSaveMarkerChanges = async () => {
    if (!adjuntoEditando || !markerAreaRef.current || !markerTargetImageRef.current) {
      return
    }

    const normalizedId = normalizeAdjuntoId(adjuntoEditando.id)
    try {
      setAdjuntoEnEdicion(normalizedId)
      const renderer = new Renderer()
      renderer.targetImage = markerTargetImageRef.current
      const dataUrl = await renderer.rasterize(markerAreaRef.current.getState())
      const editedFile = dataUrlToFile(
        dataUrl,
        buildEditedAdjuntoFilename(adjuntoEditando.filename)
      )

      await updateAdjuntoOrdenFumigacion(id, editedFile)
      const updatedOrden = await getOrdenFumigacion(id)
      applyOrdenResponse(updatedOrden, { preserveSelection: true })
      setIsEditDialogOpen(false)
      setAdjuntoEditando(null)
    } catch (error) {
      const isSecurityError =
        error instanceof DOMException &&
        (error.name === 'SecurityError' || error.message?.includes('insecure'))
      const errorMessage = isSecurityError
        ? 'No se pudo guardar la imagen por restricciones de seguridad (CORS).'
        : 'Error al guardar el adjunto editado'
      setMarkerError(errorMessage)
      alert(errorMessage)
      console.error(error)
    } finally {
      setAdjuntoEnEdicion(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    if (!isEditDialogOpen || !adjuntoEditando) {
      if (markerAreaRef.current) {
        markerAreaRef.current.remove()
        markerAreaRef.current = null
      }
      markerTargetImageRef.current = null
      if (markerObjectUrlRef.current) {
        URL.revokeObjectURL(markerObjectUrlRef.current)
        markerObjectUrlRef.current = null
      }
      setMarkerReady(false)
      return undefined
    }

    const container = markerAreaContainer
    if (!container) return undefined

    container.innerHTML = ''
    setMarkerReady(false)
    setMarkerError('')

    const markerArea = new MarkerArea()
    markerArea.style.width = '100%'
    markerArea.style.height = '70vh'
    markerArea.autoZoomIn = true
    markerArea.autoZoomOut = true

    const handleMarkerSelect = (event) => {
      const markerEditor = event?.detail?.markerEditor
      if (!markerEditor) return
      if (isTextMarkerEditor(markerEditor)) {
        setMarkerText(markerEditor.marker.text || '')
        setMarkerColor(markerEditor.marker.color || DEFAULT_MARKER_COLOR)
        setMarkerOpacity(markerEditor.marker.opacity ?? DEFAULT_MARKER_OPACITY)
        setMarkerFontFamily(normalizeFontFamily(markerEditor.marker.fontFamily))
        setMarkerFontSize(markerEditor.marker.fontSize?.value ?? DEFAULT_TEXT_FONT_SIZE)
        return
      }
      setMarkerColor(markerEditor.strokeColor)
      setMarkerWidth(markerEditor.strokeWidth)
      setMarkerOpacity(markerEditor.opacity)
    }

    markerArea.addEventListener('markerselect', handleMarkerSelect)

    const loadTargetImage = async () => {
      try {
        const response = await fetchWithAuth(adjuntoEditando.url)
        if (!response.ok) {
          throw new Error('No se pudo cargar la imagen para editar')
        }
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        markerObjectUrlRef.current = objectUrl

        const targetImage = new Image()
        targetImage.onload = () => {
          if (!isMounted) return
          markerArea.targetWidth = targetImage.naturalWidth
          markerArea.targetHeight = targetImage.naturalHeight
          markerArea.targetImage = targetImage
          markerTargetImageRef.current = targetImage
          setMarkerReady(true)
        }
        targetImage.onerror = () => {
          if (!isMounted) return
          setMarkerError('No se pudo cargar la imagen para editar')
          setMarkerReady(false)
        }
        targetImage.src = objectUrl
      } catch (error) {
        if (!isMounted) return
        setMarkerError('No se pudo cargar la imagen para editar')
        setMarkerReady(false)
        console.error(error)
      }
    }

    markerAreaRef.current = markerArea
    container.appendChild(markerArea)
    loadTargetImage()

    return () => {
      isMounted = false
      markerArea.removeEventListener('markerselect', handleMarkerSelect)
      markerArea.remove()
      markerAreaRef.current = null
      markerTargetImageRef.current = null
      if (markerObjectUrlRef.current) {
        URL.revokeObjectURL(markerObjectUrlRef.current)
        markerObjectUrlRef.current = null
      }
      setMarkerReady(false)
    }
  }, [isEditDialogOpen, adjuntoEditando?.id, markerAreaContainer])

  const handleImprimir = async (attachmentIds) => {
    const data = await imprimirOrdenFumigacion(id, attachmentIds)
    setPdfUrl(data.orden_url)
    setFechaPdf(data.orden_pdf_fecha_creacion)
    setIsDialogOpen(false)
  }

  const handleVerPdf = async () => {
    window.open(pdfUrl, '_blank');
  }

  const labelGenerarPdf = pdfUrl ? 'Regenerar PDF' : 'Generar PDF'
  const hasAdjuntos = adjuntos.length > 0
  const selectedAdjuntosArray = Array.from(selectedAdjuntos)
  const isSavingAdjunto = adjuntoEnEdicion !== null
  const isMarkerUnavailable = !markerReady || !!markerError
  const isEditSaveDisabled = isSavingAdjunto || isMarkerUnavailable
  const labelImprimirSeleccion = selectedAdjuntosArray.length > 0
    ? "Imprimir con planos"
    : "Imprimir sin planos"

  const lotesOrden = Array.isArray(orden?.lotes) && orden.lotes.length > 0
    ? orden.lotes
    : []
  const facturasOrden = Array.isArray(orden?.facturas) ? orden.facturas : []

  const formatDate = (value) => {
    if (!value) return 'Sin fecha'
    const dateString = String(value)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!isoMatch) return 'Sin fecha'
    const [, year, month, day] = isoMatch
    return `${day}/${month}/${year}`
  }

  const joinWith = (string1, string2, separator) => {
    const left = string1 ? String(string1) : 'Sin datos'
    const right = string2 ? String(string2) : 'Sin datos'
    return `${left} ${separator} ${right}`
  }

  const formatCantidad = (value) => {
    if (value === null || value === undefined || value === '') return 'Sin datos'
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) return 'Sin datos'
    return numericValue.toLocaleString('es-AR', { maximumFractionDigits: 2 })
  }

  const getEstadoVariant = (estado) => {
    const estadoNormalizado = (estado || '').toLowerCase()
    if (estadoNormalizado === 'activa') return 'destructive'
    if (estadoNormalizado === 'terminada') return 'success'
    return 'secondary'
  }

  const botonVerPdf = !!pdfUrl && (
    <Button onClick={handleVerPdf} variant="default">
      Ver Pdf
    </Button>
  )

  if (!orden) {
    return <div className="p-4">Cargando...</div>
  }

  const estadoOrden = (orden.estado_orden || '').toLowerCase()
  const estadoLabel = estadoOrden
    ? `${estadoOrden.charAt(0).toUpperCase()}${estadoOrden.slice(1)}`
    : 'Sin estado'
  const isTerminada = estadoOrden === 'terminada'
  const totalHectareas = lotesOrden.length > 0
    ? lotesOrden.reduce((acc, lote) => acc + Number(lote.hectareas ?? 0), 0)
    : (orden.hectareas ?? orden.hectareas_reales)
  const hectareasLabel = formatHectareas(totalHectareas)
  const createdAtLabel = orden.created_at_locale || 'Sin fecha'

  return (

    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 md:hidden">
          <CardTitle className="text-lg">Orden #{orden.id}</CardTitle>
          <Badge variant={getEstadoVariant(estadoOrden)}>{estadoLabel}</Badge>
        </div>
         <div className="text-sm text-muted-foreground md:hidden">
           Creado: {createdAtLabel} por: {orden.creator || 'Sin datos'}
         </div>

         <div className="hidden items-center justify-between gap-4 md:flex">
           <div className="flex flex-wrap items-center gap-4">
             <CardTitle className="text-lg">Orden #{orden.id}</CardTitle>
             <span className="text-lg font-semibold">
               {orden.nombre_estancia || 'Sin estancia'}
             </span>
              {orden.cultivo && (
                <IconLabelBadge
                  iconName="Sprout"
                  value={orden.cultivo.nombre}
                  tooltip="Cultivo"
                  variant="outline"
                  className="border-transparent bg-green-800 text-white"
                />
              )}
              <span className="text-sm text-muted-foreground">
                Creado: {createdAtLabel} por: {orden.creator || 'Sin datos'}
              </span>
           </div>
           <Badge variant={getEstadoVariant(estadoOrden)}>{estadoLabel}</Badge>
         </div>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="md:hidden">
           <div className="text-sm font-medium">Estancia</div>
           <div className="text-sm text-muted-foreground">
             {orden.nombre_estancia || 'Sin estancia'}
           </div>
            {orden.cultivo && (
              <IconLabelBadge
                iconName="Sprout"
                value={orden.cultivo.nombre}
                tooltip="Cultivo"
                variant="outline"
                className="border-transparent bg-green-800 text-white"
              />
            )}
         </div>

        {lotesOrden.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {lotesOrden.map((lote, loteIndex) => {
              const loteHectareas = formatHectareas(lote.hectareas)
              const loteKey = lote.id ?? lote.lote_id ?? `${orden.id}-${loteIndex}`
              const dosisList = Array.isArray(lote.dosis) ? lote.dosis : []
              const dosisValue = `dosis-${orden.id}-${loteKey}`

              return (
                <li key={loteKey} className="space-y-2">
                  <div>
                    Lote {lote.nombre || 'Sin nombre'}: {loteHectareas}
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={dosisValue} className="rounded-md border border-border">
                      <AccordionTrigger className="group rounded-md bg-muted/40 px-3 py-2 text-sm hover:bg-muted/60">
                        <span className="group-data-[state=open]:hidden">Ver dosis</span>
                        <span className="hidden group-data-[state=open]:inline">Ocultar dosis</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        {dosisList.length > 0 ? (
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {dosisList.map((dosis, dosisIndex) => {
                              const cantidadLabel = formatCantidad(dosis.cantidad)
                              const unidadLabel = dosis.unidad_medida
                                ? ` (${dosis.unidad_medida})`
                                : ''

                              return (
                                <li key={dosis.id ?? `${loteKey}-dosis-${dosisIndex}`}>
                                  {dosis.producto || 'Producto'}: {cantidadLabel}{unidadLabel}
                                </li>
                              )
                            })}
                          </ul>
                        ) : (
                          <div className="text-sm text-muted-foreground">Sin dosis cargadas.</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>
              Lote {orden.nombre_lote || orden.temp_lotes || 'Sin lote'}: {formatHectareas(orden.hectareas || orden.hectareas_reales)}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>Total Hectareas: {hectareasLabel}</span>
          <span>Sensible: {orden.sensible ? 'Si' : 'No'}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Comentarios: {orden.comentarios ? orden.comentarios : 'Sin comentarios'}
        </div>

        {isTerminada ? (
          <div className="space-y-2 text-sm text-muted-foreground">
             <div className="flex flex-wrap items-center gap-4">
               <IconLabelBadge
                 iconName="Tractor"
                 value={joinWith(
                   orden.maquinista?.nombre,
                   orden.fecha_trabajo_ddmmyyyy,
                   '-',
                 )}
                 tooltip="Maquinista y fecha de trabajo"
                 variant="outline"
               />
              </div>
            <div>Comentario de trabajo: {orden.info_trabajo || 'Sin datos'}</div>
            <div>Datos del clima: {orden.datos_clima || 'Sin datos'}</div>
          </div>
        ) : null}

        {facturasOrden.length > 0 ? (
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="text-sm font-medium text-foreground">Facturacion</div>
            <ul className="space-y-2">
              {facturasOrden.map((factura, facturaIndex) => (
                <li key={`${orden.id}-factura-${facturaIndex}`}>
                  <div className="flex flex-wrap gap-2">
                    <IconLabelBadge
                      iconName="ReceiptText"
                      value={factura.nro_factura || 'Sin datos'}
                      tooltip="Nro. de factura"
                      variant="outline"
                      className="border-transparent bg-violet-200 text-slate-900"
                    />
                    <IconLabelBadge
                      iconName="Calendar"
                      value={`Facturado: ${formatDate(factura.fecha_factura)}`}
                      tooltip="Fecha de facturación"
                      variant="outline"
                      className="border-transparent bg-gray-300 text-slate-900"
                    />
                    <IconLabelBadge
                      iconName="CalendarCheck"
                      value={`Cobrado: ${formatDate(factura.fecha_pago)}`}
                      tooltip="Fecha de cobro"
                      variant="outline"
                      className="border-transparent bg-lime-500 text-slate-900"
                    />
                    <IconLabelBadge
                      iconName="File"
                      value={factura.nro_orden_cliente || 'Sin datos'}
                      tooltip="Nro. de orden del cliente"
                      variant="outline"
                      className="border-transparent bg-indigo-300 text-slate-900"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={handleEditar} variant="default">Editar</Button>
        {!isTerminada ? (
          <Button onClick={handleTerminar} variant="default">Terminar</Button>
        ) : null}
        <Button onClick={handleBorrar} variant="default">Borrar</Button>
        <Button onClick={handleGenerarPdf} variant="default">
          {labelGenerarPdf}
        </Button>
        {botonVerPdf}
        <Button variant="secondary" onClick={() => navigate('/ordenes_fumigacion')}>
          Volver
        </Button>
      </CardFooter>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjuntos para PDF</DialogTitle>
            <DialogDescription>
              Selecciona los adjuntos para el PDF o edita una imagen antes de imprimir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingAdjuntos && (
              <div className="text-sm text-muted-foreground">Cargando adjuntos...</div>
            )}
            {!isLoadingAdjuntos && !hasAdjuntos && (
              <div className="text-sm text-muted-foreground">No hay adjuntos disponibles.</div>
            )}
            {!isLoadingAdjuntos && hasAdjuntos && (
              <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {adjuntos.map((adjunto) => (
                  <div
                    key={adjunto.id}
                    className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/40">
                    <Checkbox
                      checked={selectedAdjuntos.has(normalizeAdjuntoId(adjunto.id))}
                      onCheckedChange={() => handleToggleAdjunto(adjunto.id)}
                    />
                    {isImageAdjunto(adjunto) ? (
                      <img
                        src={adjunto.url}
                        alt={adjunto.filename}
                        className="h-16 w-20 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-20 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                        Archivo
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{adjunto.filename}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarAdjunto(adjunto)}
                        disabled={isSavingAdjunto || isEditDialogOpen || !isImageAdjunto(adjunto)}
                      >
                        {adjuntoEnEdicion === normalizeAdjuntoId(adjunto.id) ? 'Guardando...' : 'Editar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cerrar
            </Button>
            <Button
              onClick={() => handleImprimir(selectedAdjuntosArray)}
              disabled={isSavingAdjunto || isLoadingAdjuntos}
            >
              {labelImprimirSeleccion}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Editar adjunto</DialogTitle>
            <DialogDescription>
              Marca la imagen y presiona Guardar para aplicar los cambios.
            </DialogDescription>
          </DialogHeader>
          <div ref={editDialogRootRef} className="relative space-y-3">
            <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/20 p-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateHighlighter}
                disabled={!markerReady || !!markerError}
              >
                <Highlighter className="h-4 w-4" aria-hidden="true" />
                Resaltador
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateText}
                disabled={!markerReady || !!markerError}
              >
                <Type className="h-4 w-4" aria-hidden="true" />
                Texto
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectMode}
                disabled={!markerReady || !!markerError}
              >
                <SquareDashed className="h-4 w-4" aria-hidden="true" />
                Seleccionar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={!markerReady || !!markerError}
              >
                Eliminar
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Texto</span>
                <input
                  type="text"
                  aria-label="Texto del marcador"
                  className="h-8 w-40 rounded border bg-background px-2 text-sm text-foreground"
                  placeholder="Escribe aqui"
                  value={markerText}
                  onChange={(event) => {
                    const nextText = event.target.value
                    setMarkerText(nextText)
                    applyTextToSelection(nextText)
                  }}
                  disabled={!markerReady || !!markerError}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Fuente</span>
                <select
                  aria-label="Fuente del texto"
                  className="h-8 rounded border bg-background px-2 text-sm text-foreground"
                  value={markerFontFamily}
                  onChange={(event) => {
                    const nextFontFamily = event.target.value
                    setMarkerFontFamily(nextFontFamily)
                    applyTextStyleToSelection({ fontFamily: nextFontFamily })
                  }}
                  disabled={!markerReady || !!markerError}
                >
                  {TEXT_FONT_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Tamano</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  aria-label="Tamano de fuente"
                  className="w-28"
                  value={markerFontSize}
                  onChange={(event) => {
                    const nextFontSize = Number(event.target.value)
                    setMarkerFontSize(nextFontSize)
                    applyTextStyleToSelection({ fontSize: nextFontSize })
                  }}
                  disabled={!markerReady || !!markerError}
                />
                <span className="w-10 text-right">{markerFontSize.toFixed(1)}rem</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Color</span>
                <input
                  type="color"
                  aria-label="Color del marcador"
                  className="h-8 w-8 rounded border"
                  value={markerColor}
                  onChange={(event) => {
                    const nextColor = event.target.value
                    setMarkerColor(nextColor)
                    applySettingsToSelection({ color: nextColor })
                  }}
                  disabled={!markerReady || !!markerError}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Grosor</span>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  aria-label="Grosor del marcador"
                  className="w-28"
                  value={markerWidth}
                  onChange={(event) => {
                    const nextWidth = Number(event.target.value)
                    setMarkerWidth(nextWidth)
                    applySettingsToSelection({ width: nextWidth })
                  }}
                  disabled={!markerReady || !!markerError}
                />
                <span className="w-6 text-right">{markerWidth}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Opacidad</span>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  aria-label="Opacidad del marcador"
                  className="w-28"
                  value={markerOpacity}
                  onChange={(event) => {
                    const nextOpacity = Number(event.target.value)
                    setMarkerOpacity(nextOpacity)
                    applySettingsToSelection({ opacity: nextOpacity })
                  }}
                  disabled={!markerReady || !!markerError}
                />
                <span className="w-10 text-right">{Math.round(markerOpacity * 100)}%</span>
              </div>
            </div>
            {markerError && (
              <div className="text-sm text-destructive">{markerError}</div>
            )}
            {!markerReady && !markerError && (
              <div className="text-sm text-muted-foreground">Cargando editor...</div>
            )}
            <div
              ref={setMarkerAreaContainer}
              className="h-[70vh] w-full rounded border bg-background"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMarkerChanges} disabled={isEditSaveDisabled}>
              {isSavingAdjunto ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>

  )
}
