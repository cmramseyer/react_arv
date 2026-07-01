import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FreehandMarker,
  HighlighterMarker,
  MarkerArea,
  Renderer,
  TextMarker,
} from '@markerjs/markerjs3'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import {
  Check,
  Crop,
  Hand,
  Highlighter,
  Maximize2,
  Palette,
  Pencil,
  Redo2,
  SquareDashed,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import { fetchWithAuth } from '@/services/fetchWithAuth'
import {
  getOrdenFumigacion,
  updateAdjuntoOrdenFumigacion,
} from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const DEFAULT_MARKER_COLOR = '#ffeb3b'
const DEFAULT_INK_COLOR = '#111111'
const DEFAULT_HIGHLIGHTER_OPACITY = 0.4
const DEFAULT_FREEHAND_OPACITY = 1
const DEFAULT_TEXT_OPACITY = 1
const DEFAULT_MARKER_WIDTH = 10
const DEFAULT_TEXT_VALUE = 'Texto'
const DEFAULT_TEXT_FONT_FAMILY = 'Helvetica, Arial, sans-serif'
const DEFAULT_TEXT_FONT_SIZE = 1
const DEFAULT_TEXT_FONT_STEP = 0.1
const DEFAULT_TEXT_FONT_UNITS = 'rem'
const MARKER_ZOOM_MIN = 0.25
const MARKER_ZOOM_MAX = 4
const MARKER_ZOOM_STEP = 0.2
const MARKER_COLOR_PALETTE = [
  '#ffeb3b',
  '#ff9800',
  '#f44336',
  '#4caf50',
  '#00acc1',
  '#3f51b5',
  '#ffffff',
  '#111111',
]
const TEXT_FONT_OPTIONS = [
  { label: 'Predeterminado', value: '' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: 'Times New Roman, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet', value: 'Trebuchet MS, sans-serif' },
  { label: 'Courier', value: 'Courier New, monospace' },
]

const normalizeAdjuntoId = (adjuntoId) => String(adjuntoId)

const buildEditedAdjuntoFilename = (originalFilename) => {
  const now = new Date(Date.now())
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`

  const filenameString = typeof originalFilename === 'string' ? originalFilename : ''
  const filenameWithoutExtension = filenameString.replace(/\.[^/.]+$/, '')
  const baseName = filenameWithoutExtension || 'adjunto'

  return `${baseName}_${timestamp}.png`
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

const clampMarkerZoom = (zoomLevel) =>
  Math.min(MARKER_ZOOM_MAX, Math.max(MARKER_ZOOM_MIN, zoomLevel))

const getTouchDistance = (firstPoint, secondPoint) => {
  const deltaX = firstPoint.x - secondPoint.x
  const deltaY = firstPoint.y - secondPoint.y
  return Math.hypot(deltaX, deltaY)
}

const getTouchCenter = (firstPoint, secondPoint) => ({
  x: (firstPoint.x + secondPoint.x) / 2,
  y: (firstPoint.y + secondPoint.y) / 2,
})

const areHexColorsEqual = (firstColor, secondColor) =>
  (firstColor || '').toLowerCase() === (secondColor || '').toLowerCase()

const getColorBrightness = (hexColor) => {
  if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
    return 0
  }

  const red = Number.parseInt(hexColor.slice(1, 3), 16)
  const green = Number.parseInt(hexColor.slice(3, 5), 16)
  const blue = Number.parseInt(hexColor.slice(5, 7), 16)

  return (red * 299 + green * 587 + blue * 114) / 1000
}

const getSwatchCheckColor = (hexColor) =>
  getColorBrightness(hexColor) > 160 ? '#111111' : '#ffffff'

const normalizeFontFamily = (fontFamily) =>
  fontFamily === DEFAULT_TEXT_FONT_FAMILY ? '' : fontFamily

const buildFontSize = (value) => ({
  value,
  units: DEFAULT_TEXT_FONT_UNITS,
  step: DEFAULT_TEXT_FONT_STEP,
})

export default function DialogEditAdjunto({ ordenId, adjunto, onClose, onSaved, onSavingChange }) {
  const isOpen = Boolean(adjunto)
  const [markerColor, setMarkerColor] = useState(DEFAULT_MARKER_COLOR)
  const [markerWidth, setMarkerWidth] = useState(DEFAULT_MARKER_WIDTH)
  const [, setMarkerOpacity] = useState(DEFAULT_HIGHLIGHTER_OPACITY)
  const [markerText, setMarkerText] = useState('')
  const [markerFontFamily, setMarkerFontFamily] = useState('')
  const [markerFontSize, setMarkerFontSize] = useState(DEFAULT_TEXT_FONT_SIZE)
  const [highlighterPreset, setHighlighterPreset] = useState({
    color: DEFAULT_MARKER_COLOR,
    width: DEFAULT_MARKER_WIDTH,
  })
  const [freehandPreset, setFreehandPreset] = useState({
    color: DEFAULT_INK_COLOR,
    width: DEFAULT_MARKER_WIDTH,
  })
  const [textPreset, setTextPreset] = useState({
    color: DEFAULT_INK_COLOR,
    fontFamily: '',
    fontSize: DEFAULT_TEXT_FONT_SIZE,
  })
  const [markerReady, setMarkerReady] = useState(false)
  const [markerError, setMarkerError] = useState('')
  const [markerZoomLevel, setMarkerZoomLevel] = useState(1)
  const [isMobileMarkerToolbar, setIsMobileMarkerToolbar] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return true
    }
    return window.matchMedia('(max-width: 639px)').matches
  })
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [activeMarkerTool, setActiveMarkerTool] = useState('select')
  const [markerSelectionContext, setMarkerSelectionContext] = useState('none')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [cropSource, setCropSource] = useState('')
  const [isPreparingCrop, setIsPreparingCrop] = useState(false)
  const [isApplyingCrop, setIsApplyingCrop] = useState(false)
  const [editingImageDataUrl, setEditingImageDataUrl] = useState('')
  const [isSavingAdjunto, setIsSavingAdjunto] = useState(false)
  const markerZoomLevelRef = useRef(1)
  const [markerAreaContainer, setMarkerAreaContainer] = useState(null)
  const markerAreaRef = useRef(null)
  const markerTargetImageRef = useRef(null)
  const markerObjectUrlRef = useRef(null)
  const markerTextInputRef = useRef(null)
  const activeMarkerToolRef = useRef('select')
  const highlighterPresetRef = useRef(highlighterPreset)
  const freehandPresetRef = useRef(freehandPreset)
  const textPresetRef = useRef(textPreset)
  const pinchPointersRef = useRef(new Map())
  const pinchStartDistanceRef = useRef(null)
  const pinchCenterRef = useRef(null)
  const singlePanPointerIdRef = useRef(null)
  const singlePanLastPointRef = useRef(null)
  const cropperRef = useRef(null)

  const setMarkerTool = useCallback((nextTool) => {
    activeMarkerToolRef.current = nextTool
    setActiveMarkerTool(nextTool)
  }, [])

  const updateHighlighterPreset = useCallback((updates) => {
    setHighlighterPreset((prev) => {
      const next = { ...prev, ...updates }
      highlighterPresetRef.current = next
      return next
    })
  }, [])

  const updateTextPreset = useCallback((updates) => {
    setTextPreset((prev) => {
      const next = { ...prev, ...updates }
      textPresetRef.current = next
      return next
    })
  }, [])

  const updateFreehandPreset = useCallback((updates) => {
    setFreehandPreset((prev) => {
      const next = { ...prev, ...updates }
      freehandPresetRef.current = next
      return next
    })
  }, [])

  const applyMarkerZoom = useCallback((nextZoomLevel) => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const normalizedZoomLevel = clampMarkerZoom(nextZoomLevel)
    markerArea.zoomLevel = normalizedZoomLevel
    markerZoomLevelRef.current = normalizedZoomLevel
    setMarkerZoomLevel(normalizedZoomLevel)
  }, [])

  const applyMarkerZoomAtPoint = useCallback((nextZoomLevel, centerPoint) => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return

    const normalizedZoomLevel = clampMarkerZoom(nextZoomLevel)
    const markerCanvasContainer = markerArea.shadowRoot?.querySelector('.canvas-container')
    if (!(markerCanvasContainer instanceof HTMLElement) || !centerPoint) {
      applyMarkerZoom(normalizedZoomLevel)
      return
    }

    const previousZoom = markerArea.zoomLevel || 1
    const containerRect = markerCanvasContainer.getBoundingClientRect()
    const pointInContainer = {
      x: centerPoint.x - containerRect.left,
      y: centerPoint.y - containerRect.top,
    }
    const imagePoint = {
      x: (markerCanvasContainer.scrollLeft + pointInContainer.x) / previousZoom,
      y: (markerCanvasContainer.scrollTop + pointInContainer.y) / previousZoom,
    }

    markerArea.zoomLevel = normalizedZoomLevel
    markerZoomLevelRef.current = normalizedZoomLevel
    setMarkerZoomLevel(normalizedZoomLevel)

    markerCanvasContainer.scrollTo({
      left: imagePoint.x * normalizedZoomLevel - pointInContainer.x,
      top: imagePoint.y * normalizedZoomLevel - pointInContainer.y,
    })
  }, [applyMarkerZoom])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const handleChange = (event) => {
      setIsMobileMarkerToolbar(event.matches)
    }

    setIsMobileMarkerToolbar(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  const handleEditDialogChange = (open) => {
    if (open) return
    onClose()
  }

  const handleZoomIn = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    applyMarkerZoom(markerArea.zoomLevel + MARKER_ZOOM_STEP)
  }

  const handleZoomOut = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    applyMarkerZoom(markerArea.zoomLevel - MARKER_ZOOM_STEP)
  }

  const handleZoomReset = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    markerArea.autoZoom()
    const normalizedZoomLevel = clampMarkerZoom(markerArea.zoomLevel)
    markerZoomLevelRef.current = normalizedZoomLevel
    setMarkerZoomLevel(normalizedZoomLevel)
  }

  const isTextMarkerEditor = (markerEditor) =>
    markerEditor?.marker?.typeName === TextMarker.typeName

  const isHighlighterMarkerEditor = (markerEditor) =>
    markerEditor?.marker?.typeName === HighlighterMarker.typeName

  const isFreehandMarkerEditor = (markerEditor) =>
    markerEditor?.marker?.typeName === FreehandMarker.typeName

  const getMarkerEditorKind = (markerEditor) => {
    if (!markerEditor?.marker) return null
    if (isTextMarkerEditor(markerEditor)) return 'text'
    if (isHighlighterMarkerEditor(markerEditor)) return 'highlighter'
    if (isFreehandMarkerEditor(markerEditor)) return 'freehand'
    return 'stroke'
  }

  const getSelectionContextFromArea = (markerArea) => {
    if (!markerArea) return 'none'
    const selectedEditors = markerArea.selectedMarkerEditors || []
    if (selectedEditors.length > 0) {
      const selectedKinds = selectedEditors
        .map(getMarkerEditorKind)
        .filter((kind) => kind !== null)

      const hasTextMarkers = selectedKinds.includes('text')
      const hasHighlighterMarkers = selectedKinds.includes('highlighter')
      const hasFreehandMarkers = selectedKinds.includes('freehand')
      const hasGenericStrokeMarkers = selectedKinds.includes('stroke')
      const hasStrokeMarkers = hasHighlighterMarkers || hasFreehandMarkers || hasGenericStrokeMarkers

      if (hasTextMarkers && hasStrokeMarkers) return 'mixed'
      if (hasTextMarkers) return 'text'
      if (hasHighlighterMarkers && !hasFreehandMarkers && !hasGenericStrokeMarkers) return 'highlighter'
      if (hasFreehandMarkers && !hasHighlighterMarkers && !hasGenericStrokeMarkers) return 'freehand'
      if (hasStrokeMarkers) return 'stroke'
    }

    if (markerArea.currentMarkerEditor) {
      return getMarkerEditorKind(markerArea.currentMarkerEditor) || 'none'
    }

    return 'none'
  }

  const syncUndoRedoAvailability = (markerArea = markerAreaRef.current) => {
    if (!markerArea) {
      setCanUndo(false)
      setCanRedo(false)
      return
    }

    setCanUndo(Boolean(markerArea.isUndoPossible))
    setCanRedo(Boolean(markerArea.isRedoPossible))
  }

  const syncToolbarFromEditor = (markerEditor) => {
    if (!markerEditor) return

    if (isTextMarkerEditor(markerEditor)) {
      setMarkerText(markerEditor.marker.text || '')
      setMarkerColor(markerEditor.marker.color || DEFAULT_MARKER_COLOR)
      setMarkerOpacity(markerEditor.marker.opacity ?? DEFAULT_TEXT_OPACITY)
      setMarkerFontFamily(normalizeFontFamily(markerEditor.marker.fontFamily))
      setMarkerFontSize(markerEditor.marker.fontSize?.value ?? DEFAULT_TEXT_FONT_SIZE)
      return
    }

    setMarkerColor(markerEditor.strokeColor || DEFAULT_MARKER_COLOR)
    setMarkerWidth(markerEditor.strokeWidth ?? DEFAULT_MARKER_WIDTH)
    if (isFreehandMarkerEditor(markerEditor)) {
      setMarkerOpacity(markerEditor.opacity ?? DEFAULT_FREEHAND_OPACITY)
    } else {
      setMarkerOpacity(markerEditor.opacity ?? DEFAULT_HIGHLIGHTER_OPACITY)
    }
  }

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

    markerEditor.marker.opacity = DEFAULT_TEXT_OPACITY
  }

  const applyMarkerSettings = (markerEditor, overrides = {}) => {
    if (!markerEditor) return
    const nextColor = overrides.color ?? markerColor
    const nextWidth = overrides.width ?? markerWidth
    if (isTextMarkerEditor(markerEditor)) {
      applyTextStyleToEditor(markerEditor, {
        color: overrides.color !== undefined ? nextColor : undefined,
        opacity: DEFAULT_TEXT_OPACITY,
      })
      return
    }
    markerEditor.strokeColor = nextColor
    if (overrides.width !== undefined) {
      markerEditor.strokeWidth = nextWidth
    }
    markerEditor.opacity = isFreehandMarkerEditor(markerEditor)
      ? DEFAULT_FREEHAND_OPACITY
      : DEFAULT_HIGHLIGHTER_OPACITY
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

  const applyHighlighterPresetToEditor = (markerEditor, preset = highlighterPresetRef.current) => {
    applyMarkerSettings(markerEditor, {
      color: preset.color,
      width: preset.width,
    })
  }

  const applyFreehandPresetToEditor = (markerEditor, preset = freehandPresetRef.current) => {
    applyMarkerSettings(markerEditor, {
      color: preset.color,
      width: preset.width,
    })
  }

  const applyTextPresetToEditor = (markerEditor, preset = textPresetRef.current) => {
    applyTextStyleToEditor(markerEditor, {
      color: preset.color,
      opacity: DEFAULT_TEXT_OPACITY,
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
    })
  }

  const loadHighlighterPresetControls = (preset = highlighterPresetRef.current) => {
    setMarkerColor(preset.color)
    setMarkerWidth(preset.width)
    setMarkerOpacity(DEFAULT_HIGHLIGHTER_OPACITY)
  }

  const loadFreehandPresetControls = (preset = freehandPresetRef.current) => {
    setMarkerColor(preset.color)
    setMarkerWidth(preset.width)
    setMarkerOpacity(DEFAULT_FREEHAND_OPACITY)
  }

  const loadTextPresetControls = (preset = textPresetRef.current) => {
    setMarkerColor(preset.color)
    setMarkerOpacity(DEFAULT_TEXT_OPACITY)
    setMarkerFontFamily(preset.fontFamily)
    setMarkerFontSize(preset.fontSize)
  }

  const getPresetKindForCurrentContext = () => {
    const activeTool = activeMarkerToolRef.current
    if (activeTool === 'highlighter') return 'highlighter'
    if (activeTool === 'freehand') return 'freehand'
    if (activeTool === 'text') return 'text'
    if (markerSelectionContext === 'highlighter') return 'highlighter'
    if (markerSelectionContext === 'freehand') return 'freehand'
    if (markerSelectionContext === 'text') return 'text'
    return null
  }

  const handleMarkerWidthChange = (nextWidth) => {
    setMarkerWidth(nextWidth)
    applySettingsToSelection({ width: nextWidth })

    const presetKind = getPresetKindForCurrentContext()
    if (presetKind === 'highlighter') {
      updateHighlighterPreset({ width: nextWidth })
    } else if (presetKind === 'freehand') {
      updateFreehandPreset({ width: nextWidth })
    }
  }

  const handleMarkerFontFamilyChange = (nextFontFamily) => {
    setMarkerFontFamily(nextFontFamily)
    applyTextStyleToSelection({ fontFamily: nextFontFamily })
    updateTextPreset({ fontFamily: nextFontFamily })
  }

  const handleMarkerFontSizeChange = (nextFontSize) => {
    setMarkerFontSize(nextFontSize)
    applyTextStyleToSelection({ fontSize: nextFontSize })
    updateTextPreset({ fontSize: nextFontSize })
  }

  const handleCreateHighlighter = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const nextPreset = highlighterPresetRef.current
    setMarkerTool('highlighter')
    setMarkerSelectionContext('highlighter')
    loadHighlighterPresetControls(nextPreset)
    const markerEditor = markerArea.createMarker(HighlighterMarker)
    if (markerEditor) {
      applyHighlighterPresetToEditor(markerEditor, nextPreset)
      syncToolbarFromEditor(markerEditor)
      syncUndoRedoAvailability(markerArea)
    }
  }

  const handleCreateFreehand = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const nextPreset = freehandPresetRef.current
    setMarkerTool('freehand')
    setMarkerSelectionContext('freehand')
    loadFreehandPresetControls(nextPreset)
    const markerEditor = markerArea.createMarker(FreehandMarker)
    if (markerEditor) {
      applyFreehandPresetToEditor(markerEditor, nextPreset)
      syncToolbarFromEditor(markerEditor)
      syncUndoRedoAvailability(markerArea)
    }
  }

  const handleCreateText = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    const nextPreset = textPresetRef.current
    setMarkerTool('text')
    setMarkerSelectionContext('text')
    loadTextPresetControls(nextPreset)
    setMarkerText(DEFAULT_TEXT_VALUE)
    const markerEditor = markerArea.createMarker(TextMarker)
    if (markerEditor) {
      const nextText = DEFAULT_TEXT_VALUE
      applyTextToEditor(markerEditor, nextText)
      applyTextPresetToEditor(markerEditor, nextPreset)
      syncToolbarFromEditor(markerEditor)
      syncUndoRedoAvailability(markerArea)
    }
  }

  const handleCropMode = async () => {
    const markerArea = markerAreaRef.current
    const targetImage = markerTargetImageRef.current
    if (!markerArea || !targetImage || isPreparingCrop) return

    try {
      setIsPreparingCrop(true)
      setMarkerTool('crop')
      markerArea.switchToSelectMode()
      setMarkerSelectionContext('none')
      syncUndoRedoAvailability(markerArea)

      const renderer = new Renderer()
      renderer.targetImage = targetImage
      const rasterizedDataUrl = await renderer.rasterize(markerArea.getState())
      setCropSource(rasterizedDataUrl)
      setIsCropDialogOpen(true)
    } catch (error) {
      alert('No se pudo iniciar el recorte')
      console.error(error)
    } finally {
      setIsPreparingCrop(false)
    }
  }

  const handleApplyCrop = async () => {
    const cropperInstance = cropperRef.current?.cropper
    if (!cropperInstance) return

    try {
      setIsApplyingCrop(true)
      const croppedCanvas = cropperInstance.getCroppedCanvas({
        imageSmoothingQuality: 'high',
      })

      if (!croppedCanvas) return

      const croppedDataUrl = croppedCanvas.toDataURL('image/png')
      setEditingImageDataUrl(croppedDataUrl)
      setIsCropDialogOpen(false)
      setCropSource('')
      setMarkerTool('select')
      setMarkerSelectionContext('none')
    } catch (error) {
      alert('No se pudo aplicar el recorte')
      console.error(error)
    } finally {
      setIsApplyingCrop(false)
    }
  }

  const handleCloseCrop = () => {
    setIsCropDialogOpen(false)
    setCropSource('')
    setIsPreparingCrop(false)
    setIsApplyingCrop(false)
    setMarkerTool('select')
    const markerArea = markerAreaRef.current
    if (markerArea) {
      setMarkerSelectionContext(getSelectionContextFromArea(markerArea))
    } else {
      setMarkerSelectionContext('none')
    }
  }

  const handleSelectMode = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    setMarkerTool('select')
    markerArea.switchToSelectMode()
    setMarkerSelectionContext(getSelectionContextFromArea(markerArea))
    syncUndoRedoAvailability(markerArea)
  }

  const handlePanMode = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    setMarkerTool('pan')
    markerArea.switchToSelectMode()
    setMarkerSelectionContext('none')
    syncUndoRedoAvailability(markerArea)
  }

  const handleDeleteSelected = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea) return
    markerArea.deleteSelectedMarkers()
    setMarkerSelectionContext(getSelectionContextFromArea(markerArea))
    syncUndoRedoAvailability(markerArea)
  }

  const handleUndo = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea || !markerArea.isUndoPossible) return
    markerArea.undo()
    syncUndoRedoAvailability(markerArea)
    setMarkerSelectionContext(getSelectionContextFromArea(markerArea))
  }

  const handleRedo = () => {
    const markerArea = markerAreaRef.current
    if (!markerArea || !markerArea.isRedoPossible) return
    markerArea.redo()
    syncUndoRedoAvailability(markerArea)
    setMarkerSelectionContext(getSelectionContextFromArea(markerArea))
  }

  const handleMarkerColorChange = (nextColor) => {
    setMarkerColor(nextColor)
    applySettingsToSelection({ color: nextColor })

    const presetKind = getPresetKindForCurrentContext()
    if (presetKind === 'highlighter') {
      updateHighlighterPreset({ color: nextColor })
    } else if (presetKind === 'freehand') {
      updateFreehandPreset({ color: nextColor })
    } else if (presetKind === 'text') {
      updateTextPreset({ color: nextColor })
    }
  }

  const handleSaveMarkerChanges = async () => {
    if (!adjunto || !markerAreaRef.current || !markerTargetImageRef.current) {
      return
    }

    const normalizedId = normalizeAdjuntoId(adjunto.id)
    try {
      setIsSavingAdjunto(true)
      onSavingChange(normalizedId)
      const renderer = new Renderer()
      renderer.targetImage = markerTargetImageRef.current
      const finalDataUrl = await renderer.rasterize(markerAreaRef.current.getState())
      const editedFile = dataUrlToFile(
        finalDataUrl,
        buildEditedAdjuntoFilename(adjunto.filename)
      )

      await updateAdjuntoOrdenFumigacion(ordenId, editedFile)
      const updatedOrden = await getOrdenFumigacion(ordenId)
      onSaved(updatedOrden)
      onClose()
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
      setIsSavingAdjunto(false)
      onSavingChange(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    if (!isOpen || !adjunto) {
      if (markerAreaRef.current) {
        markerAreaRef.current.remove()
        markerAreaRef.current = null
      }
      markerTargetImageRef.current = null
      if (markerObjectUrlRef.current) {
        if (typeof URL.revokeObjectURL === 'function') {
          URL.revokeObjectURL(markerObjectUrlRef.current)
        }
        markerObjectUrlRef.current = null
      }
      setMarkerReady(false)
      setMarkerError('')
      setMarkerZoomLevel(1)
      setMarkerTool('select')
      setMarkerSelectionContext('none')
      setCanUndo(false)
      setCanRedo(false)
      setShowColorPicker(false)
      setIsCropDialogOpen(false)
      setCropSource('')
      setIsPreparingCrop(false)
      setIsApplyingCrop(false)
      setEditingImageDataUrl('')
      markerZoomLevelRef.current = 1
      pinchPointersRef.current.clear()
      pinchStartDistanceRef.current = null
      pinchCenterRef.current = null
      singlePanPointerIdRef.current = null
      singlePanLastPointRef.current = null
      return undefined
    }

    const container = markerAreaContainer
    if (!container) return undefined

    container.innerHTML = ''
    setMarkerReady(false)
    setMarkerError('')
    setMarkerTool('select')
    setMarkerSelectionContext('none')
    setCanUndo(false)
    setCanRedo(false)
    setShowColorPicker(false)
    setIsCropDialogOpen(false)
    setCropSource('')
    setIsPreparingCrop(false)
    setIsApplyingCrop(false)
    pinchPointersRef.current.clear()
    pinchStartDistanceRef.current = null
    pinchCenterRef.current = null
    singlePanPointerIdRef.current = null
    singlePanLastPointRef.current = null

    const markerArea = new MarkerArea()
    markerArea.style.width = '100%'
    markerArea.style.height = '100%'
    markerArea.autoZoomIn = true
    markerArea.autoZoomOut = true

    const handleMarkerSelect = (event) => {
      const markerEditor = event?.detail?.markerEditor
      if (!markerEditor) return
      syncToolbarFromEditor(markerEditor)
      const activeArea = event?.detail?.markerArea || markerArea
      setMarkerSelectionContext(getSelectionContextFromArea(activeArea))
      syncUndoRedoAvailability(activeArea)
    }

    const handleMarkerDeselect = (event) => {
      const activeArea = event?.detail?.markerArea || markerArea
      setMarkerSelectionContext(getSelectionContextFromArea(activeArea))
      syncUndoRedoAvailability(activeArea)
    }

    const handleMarkerCreate = (event) => {
      const markerEditor = event?.detail?.markerEditor
      if (!markerEditor) return
      const activeArea = event?.detail?.markerArea || markerArea
      const activeTool = activeMarkerToolRef.current

      if (activeTool === 'highlighter') {
        const nextEditor = activeArea.createMarker(HighlighterMarker)
        if (nextEditor) {
          applyHighlighterPresetToEditor(nextEditor)
          syncToolbarFromEditor(nextEditor)
        }
      } else if (activeTool === 'freehand') {
        const nextEditor = activeArea.createMarker(FreehandMarker)
        if (nextEditor) {
          applyFreehandPresetToEditor(nextEditor)
          syncToolbarFromEditor(nextEditor)
        }
      } else {
        syncToolbarFromEditor(markerEditor)
      }

      if (activeTool === 'text') {
        setMarkerTool('select')
        requestAnimationFrame(() => {
          const input = markerTextInputRef.current
          if (!input) return
          input.focus()
          input.select()
        })
      }

      setMarkerSelectionContext(getSelectionContextFromArea(activeArea))
      syncUndoRedoAvailability(activeArea)
    }

    const handleMarkerChange = (event) => {
      const markerEditor = event?.detail?.markerEditor
      if (!markerEditor) return
      syncToolbarFromEditor(markerEditor)
      const activeArea = event?.detail?.markerArea || markerArea
      setMarkerSelectionContext(getSelectionContextFromArea(activeArea))
      syncUndoRedoAvailability(activeArea)
    }

    const handleAreaStateChange = (event) => {
      syncUndoRedoAvailability(event?.detail?.markerArea || markerArea)
    }

    markerArea.addEventListener('markerselect', handleMarkerSelect)
    markerArea.addEventListener('markerdeselect', handleMarkerDeselect)
    markerArea.addEventListener('markercreate', handleMarkerCreate)
    markerArea.addEventListener('markerchange', handleMarkerChange)
    markerArea.addEventListener('areastatechange', handleAreaStateChange)

    const loadTargetImage = async () => {
      try {
        const targetImage = new Image()
        targetImage.onload = () => {
          if (!isMounted) return
          markerArea.targetWidth = targetImage.naturalWidth
          markerArea.targetHeight = targetImage.naturalHeight
          markerArea.targetImage = targetImage
          const markerCanvasContainer = markerArea.shadowRoot?.querySelector('.canvas-container')
          if (markerCanvasContainer instanceof HTMLElement) {
            markerCanvasContainer.style.touchAction = 'none'
          }
          markerTargetImageRef.current = targetImage
          setMarkerReady(true)
          requestAnimationFrame(() => {
            if (!isMounted) return
            const normalizedZoomLevel = clampMarkerZoom(markerArea.zoomLevel)
            markerZoomLevelRef.current = normalizedZoomLevel
            setMarkerZoomLevel(normalizedZoomLevel)
            syncUndoRedoAvailability(markerArea)
          })
        }
        targetImage.onerror = () => {
          if (!isMounted) return
          setMarkerError('No se pudo cargar la imagen para editar')
          setMarkerReady(false)
        }

        if (editingImageDataUrl) {
          if (markerObjectUrlRef.current) {
            if (typeof URL.revokeObjectURL === 'function') {
              URL.revokeObjectURL(markerObjectUrlRef.current)
            }
            markerObjectUrlRef.current = null
          }
          targetImage.src = editingImageDataUrl
          return
        }

        const response = await fetchWithAuth(adjunto.url)
        if (!response.ok) {
          throw new Error('No se pudo cargar la imagen para editar')
        }
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        markerObjectUrlRef.current = objectUrl
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
      markerArea.removeEventListener('markerdeselect', handleMarkerDeselect)
      markerArea.removeEventListener('markercreate', handleMarkerCreate)
      markerArea.removeEventListener('markerchange', handleMarkerChange)
      markerArea.removeEventListener('areastatechange', handleAreaStateChange)
      markerArea.remove()
      markerAreaRef.current = null
      markerTargetImageRef.current = null
      if (markerObjectUrlRef.current) {
        if (typeof URL.revokeObjectURL === 'function') {
          URL.revokeObjectURL(markerObjectUrlRef.current)
        }
        markerObjectUrlRef.current = null
      }
      setMarkerReady(false)
      setMarkerZoomLevel(1)
      setMarkerTool('select')
      setMarkerSelectionContext('none')
      setCanUndo(false)
      setCanRedo(false)
      setShowColorPicker(false)
      setIsCropDialogOpen(false)
      setCropSource('')
      setIsPreparingCrop(false)
      setIsApplyingCrop(false)
      markerZoomLevelRef.current = 1
      pinchPointersRef.current.clear()
      pinchStartDistanceRef.current = null
      pinchCenterRef.current = null
      singlePanPointerIdRef.current = null
      singlePanLastPointRef.current = null
    }
  }, [adjunto, editingImageDataUrl, isOpen, markerAreaContainer, setMarkerTool])

  useEffect(() => {
    if (!isOpen || !markerAreaContainer) return undefined

    const activePointers = pinchPointersRef.current
    const listenerOptions = { capture: true, passive: false }

    const getMarkerCanvasContainer = () => {
      const markerArea = markerAreaRef.current
      const markerCanvasContainer = markerArea?.shadowRoot?.querySelector('.canvas-container')
      return markerCanvasContainer instanceof HTMLElement ? markerCanvasContainer : null
    }

    const canSingleFingerPan = () => {
      const markerArea = markerAreaRef.current
      const zoomLevel = markerArea?.zoomLevel ?? markerZoomLevelRef.current
      return activeMarkerTool === 'pan' && zoomLevel > 1
    }

    const handlePointerDown = (event) => {
      if (event.pointerType !== 'touch') return
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (activePointers.size === 1 && canSingleFingerPan()) {
        singlePanPointerIdRef.current = event.pointerId
        singlePanLastPointRef.current = { x: event.clientX, y: event.clientY }
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (activePointers.size === 2) {
        const [firstPoint, secondPoint] = Array.from(activePointers.values())
        pinchStartDistanceRef.current = getTouchDistance(firstPoint, secondPoint)
        pinchCenterRef.current = getTouchCenter(firstPoint, secondPoint)
        singlePanPointerIdRef.current = null
        singlePanLastPointRef.current = null
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const handlePointerMove = (event) => {
      if (event.pointerType !== 'touch' || !activePointers.has(event.pointerId)) return

      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (singlePanPointerIdRef.current === event.pointerId && activePointers.size === 1) {
        if (!canSingleFingerPan()) {
          singlePanPointerIdRef.current = null
          singlePanLastPointRef.current = null
          return
        }

        const markerCanvasContainer = getMarkerCanvasContainer()
        const previousPoint = singlePanLastPointRef.current
        if (markerCanvasContainer && previousPoint) {
          markerCanvasContainer.scrollBy({
            left: previousPoint.x - event.clientX,
            top: previousPoint.y - event.clientY,
          })
        }
        singlePanLastPointRef.current = { x: event.clientX, y: event.clientY }
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (activePointers.size !== 2 || !pinchStartDistanceRef.current) return

      const markerCanvasContainer = getMarkerCanvasContainer()
      if (!markerCanvasContainer) return

      event.preventDefault()
      event.stopPropagation()

      const [firstPoint, secondPoint] = Array.from(activePointers.values())
      const currentCenter = getTouchCenter(firstPoint, secondPoint)
      const previousCenter = pinchCenterRef.current
      if (previousCenter) {
        markerCanvasContainer.scrollBy({
          left: previousCenter.x - currentCenter.x,
          top: previousCenter.y - currentCenter.y,
        })
      }

      const currentDistance = getTouchDistance(firstPoint, secondPoint)
      if (currentDistance > 0) {
        const distanceRatio = currentDistance / pinchStartDistanceRef.current
        if (Math.abs(distanceRatio - 1) > 0.002) {
          const markerArea = markerAreaRef.current
          const currentZoomLevel = markerArea?.zoomLevel ?? markerZoomLevelRef.current
          applyMarkerZoomAtPoint(currentZoomLevel * distanceRatio, currentCenter)
        }
      }

      pinchStartDistanceRef.current = currentDistance
      pinchCenterRef.current = currentCenter
    }

    const handlePointerEnd = (event) => {
      if (event.pointerType !== 'touch') return

      activePointers.delete(event.pointerId)
      if (singlePanPointerIdRef.current === event.pointerId) {
        singlePanPointerIdRef.current = null
        singlePanLastPointRef.current = null
      }

      if (activePointers.size < 2) {
        pinchStartDistanceRef.current = null
        pinchCenterRef.current = null
      }

      if (activePointers.size === 1 && canSingleFingerPan()) {
        const [remainingPointerId, remainingPoint] = Array.from(activePointers.entries())[0]
        singlePanPointerIdRef.current = remainingPointerId
        singlePanLastPointRef.current = remainingPoint
      }
    }

    markerAreaContainer.addEventListener('pointerdown', handlePointerDown, listenerOptions)
    markerAreaContainer.addEventListener('pointermove', handlePointerMove, listenerOptions)
    markerAreaContainer.addEventListener('pointerup', handlePointerEnd, listenerOptions)
    markerAreaContainer.addEventListener('pointercancel', handlePointerEnd, listenerOptions)

    return () => {
      markerAreaContainer.removeEventListener('pointerdown', handlePointerDown, listenerOptions)
      markerAreaContainer.removeEventListener('pointermove', handlePointerMove, listenerOptions)
      markerAreaContainer.removeEventListener('pointerup', handlePointerEnd, listenerOptions)
      markerAreaContainer.removeEventListener('pointercancel', handlePointerEnd, listenerOptions)
      activePointers.clear()
      pinchStartDistanceRef.current = null
      pinchCenterRef.current = null
      singlePanPointerIdRef.current = null
      singlePanLastPointRef.current = null
    }
  }, [activeMarkerTool, applyMarkerZoomAtPoint, isOpen, markerAreaContainer])

  const isMarkerUnavailable = !markerReady || !!markerError
  const isEditSaveDisabled = isSavingAdjunto || isMarkerUnavailable
  const markerToolsDisabled = !markerReady || !!markerError
  const markerControlContext = markerSelectionContext !== 'none'
    ? markerSelectionContext
    : activeMarkerTool === 'text'
      ? 'text'
      : activeMarkerTool === 'highlighter' || activeMarkerTool === 'freehand'
        ? 'stroke'
        : 'none'
  const showTextControls = markerControlContext === 'text'
  const showStrokeControls =
    markerControlContext === 'stroke' ||
    markerControlContext === 'highlighter' ||
    markerControlContext === 'freehand'
  const showMixedControls = markerControlContext === 'mixed'

  return (
    <Dialog open={isOpen} onOpenChange={handleEditDialogChange}>
      <DialogContent
        aria-describedby={undefined}
        className="!left-0 !top-0 !flex !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 !flex-col !gap-3 !overflow-hidden rounded-none p-3 sm:!left-[50%] sm:!top-[50%] sm:!h-[92dvh] sm:!w-[95vw] sm:!max-w-6xl sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:rounded-lg sm:p-6"
      >
        <DialogHeader>
          <DialogTitle>Editar adjunto</DialogTitle>
        </DialogHeader>
        <div className="relative flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-2">
            {isMobileMarkerToolbar && (
              <>
                <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto rounded-md border bg-muted/20 p-1.5">
                  <Button type="button" variant={activeMarkerTool === 'select' ? 'default' : 'outline'} size="icon" aria-label="Seleccionar" title="Seleccionar" className="size-10 shrink-0" onClick={handleSelectMode} disabled={markerToolsDisabled}><SquareDashed className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant={activeMarkerTool === 'highlighter' ? 'default' : 'outline'} size="icon" aria-label="Resaltador" title="Resaltador" className="size-10 shrink-0" onClick={handleCreateHighlighter} disabled={markerToolsDisabled}><Highlighter className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant={activeMarkerTool === 'text' ? 'default' : 'outline'} size="icon" aria-label="Texto" title="Texto" className="size-10 shrink-0" onClick={handleCreateText} disabled={markerToolsDisabled}><Type className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant={activeMarkerTool === 'freehand' ? 'default' : 'outline'} size="icon" aria-label="Dibujo libre" title="Dibujo libre" className="size-10 shrink-0" onClick={handleCreateFreehand} disabled={markerToolsDisabled}><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant="outline" size="icon" aria-label="Eliminar seleccion" title="Eliminar seleccion" className="size-10 shrink-0" onClick={handleDeleteSelected} disabled={markerToolsDisabled}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant="outline" size="icon" aria-label="Deshacer" title="Deshacer" className="size-10 shrink-0" onClick={handleUndo} disabled={markerToolsDisabled || !canUndo}><Undo2 className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant="outline" size="icon" aria-label="Rehacer" title="Rehacer" className="size-10 shrink-0" onClick={handleRedo} disabled={markerToolsDisabled || !canRedo}><Redo2 className="h-4 w-4" aria-hidden="true" /></Button>
                </div>

                <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto rounded-md border bg-muted/20 p-1.5">
                  <Button type="button" variant="outline" size="icon" aria-label="Alejar" title="Alejar" className="size-10 shrink-0" onClick={handleZoomOut} disabled={markerToolsDisabled}><ZoomOut className="h-4 w-4" aria-hidden="true" /></Button>
                  <span className="w-12 shrink-0 text-center text-xs font-medium text-muted-foreground">{Math.round(markerZoomLevel * 100)}%</span>
                  <Button type="button" variant="outline" size="icon" aria-label="Acercar" title="Acercar" className="size-10 shrink-0" onClick={handleZoomIn} disabled={markerToolsDisabled}><ZoomIn className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant="outline" size="icon" aria-label="Ajustar zoom" title="Ajustar zoom" className="size-10 shrink-0" onClick={handleZoomReset} disabled={markerToolsDisabled}><Maximize2 className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant={activeMarkerTool === 'crop' ? 'default' : 'outline'} size="icon" aria-label="Recortar" title="Recortar" className="size-10 shrink-0" onClick={handleCropMode} disabled={markerToolsDisabled || isPreparingCrop}><Crop className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" variant={activeMarkerTool === 'pan' ? 'default' : 'outline'} size="icon" aria-label="Desplazar" title="Desplazar" className="size-10 shrink-0" onClick={handlePanMode} disabled={markerToolsDisabled}><Hand className="h-4 w-4" aria-hidden="true" /></Button>
                </div>
              </>
            )}

            {!isMobileMarkerToolbar && (
              <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto rounded-md border bg-muted/20 p-1.5">
                <Button type="button" variant={activeMarkerTool === 'select' ? 'default' : 'outline'} size="icon" aria-label="Seleccionar" title="Seleccionar" className="size-8 shrink-0" onClick={handleSelectMode} disabled={markerToolsDisabled}><SquareDashed className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant={activeMarkerTool === 'highlighter' ? 'default' : 'outline'} size="icon" aria-label="Resaltador" title="Resaltador" className="size-8 shrink-0" onClick={handleCreateHighlighter} disabled={markerToolsDisabled}><Highlighter className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant={activeMarkerTool === 'text' ? 'default' : 'outline'} size="icon" aria-label="Texto" title="Texto" className="size-8 shrink-0" onClick={handleCreateText} disabled={markerToolsDisabled}><Type className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant={activeMarkerTool === 'freehand' ? 'default' : 'outline'} size="icon" aria-label="Dibujo libre" title="Dibujo libre" className="size-8 shrink-0" onClick={handleCreateFreehand} disabled={markerToolsDisabled}><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant="outline" size="icon" aria-label="Eliminar seleccion" title="Eliminar seleccion" className="size-8 shrink-0" onClick={handleDeleteSelected} disabled={markerToolsDisabled}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant="outline" size="icon" aria-label="Deshacer" title="Deshacer" className="size-8 shrink-0" onClick={handleUndo} disabled={markerToolsDisabled || !canUndo}><Undo2 className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant="outline" size="icon" aria-label="Rehacer" title="Rehacer" className="size-8 shrink-0" onClick={handleRedo} disabled={markerToolsDisabled || !canRedo}><Redo2 className="h-4 w-4" aria-hidden="true" /></Button>
                <div className="mx-1 h-7 w-px shrink-0 bg-border" aria-hidden="true" />
                <Button type="button" variant="outline" size="icon" aria-label="Alejar" title="Alejar" className="size-8 shrink-0" onClick={handleZoomOut} disabled={markerToolsDisabled}><ZoomOut className="h-4 w-4" aria-hidden="true" /></Button>
                <span className="w-12 shrink-0 text-center text-xs font-medium text-muted-foreground">{Math.round(markerZoomLevel * 100)}%</span>
                <Button type="button" variant="outline" size="icon" aria-label="Acercar" title="Acercar" className="size-8 shrink-0" onClick={handleZoomIn} disabled={markerToolsDisabled}><ZoomIn className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant="outline" size="icon" aria-label="Ajustar zoom" title="Ajustar zoom" className="size-8 shrink-0" onClick={handleZoomReset} disabled={markerToolsDisabled}><Maximize2 className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant={activeMarkerTool === 'crop' ? 'default' : 'outline'} size="icon" aria-label="Recortar" title="Recortar" className="size-8 shrink-0" onClick={handleCropMode} disabled={markerToolsDisabled || isPreparingCrop}><Crop className="h-4 w-4" aria-hidden="true" /></Button>
                <Button type="button" variant={activeMarkerTool === 'pan' ? 'default' : 'outline'} size="icon" aria-label="Desplazar" title="Desplazar" className="size-8 shrink-0" onClick={handlePanMode} disabled={markerToolsDisabled}><Hand className="h-4 w-4" aria-hidden="true" /></Button>
              </div>
            )}

            {showStrokeControls && (
              <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {MARKER_COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Color ${color}`}
                      aria-pressed={areHexColorsEqual(markerColor, color)}
                      title={color}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${areHexColorsEqual(markerColor, color) ? 'border-primary/70 ring-2 ring-primary ring-offset-1 ring-offset-background' : 'border-foreground/20'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleMarkerColorChange(color)}
                      disabled={markerToolsDisabled}
                    >
                      {areHexColorsEqual(markerColor, color) && <Check className="h-3.5 w-3.5" style={{ color: getSwatchCheckColor(color) }} aria-hidden="true" />}
                    </button>
                  ))}
                  <Button type="button" variant="outline" size="icon" aria-label="Abrir selector de color" title="Abrir selector de color" className="size-8 shrink-0" onClick={() => setShowColorPicker((prev) => !prev)} disabled={markerToolsDisabled}><Palette className="h-4 w-4" aria-hidden="true" /></Button>
                  {showColorPicker && <input type="color" aria-label="Color personalizado" className="h-8 w-8 shrink-0 rounded border" value={markerColor} onChange={(event) => { handleMarkerColorChange(event.target.value) }} disabled={markerToolsDisabled} />}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-14 shrink-0">Grosor</span>
                  <input type="range" min="1" max="30" step="1" aria-label="Grosor del marcador" className="w-full" value={markerWidth} onChange={(event) => { const nextWidth = Number(event.target.value); handleMarkerWidthChange(nextWidth) }} disabled={markerToolsDisabled} />
                  <span className="w-8 text-right">{markerWidth}</span>
                </div>
              </div>
            )}

            {showTextControls && (
              <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-2">
                <input ref={markerTextInputRef} type="text" aria-label="Texto del marcador" className="h-9 rounded border bg-background px-2 text-sm text-foreground" placeholder="Escribe aqui" value={markerText} onChange={(event) => { const nextText = event.target.value; setMarkerText(nextText); applyTextToSelection(nextText) }} disabled={markerToolsDisabled} />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-14 shrink-0">Fuente</span>
                  <select aria-label="Fuente del texto" className="h-9 w-full rounded border bg-background px-2 text-sm text-foreground" value={markerFontFamily} onChange={(event) => { const nextFontFamily = event.target.value; handleMarkerFontFamilyChange(nextFontFamily) }} disabled={markerToolsDisabled}>
                    {TEXT_FONT_OPTIONS.map((option) => (
                      <option key={option.label} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-14 shrink-0">Tamano</span>
                  <input type="range" min="0.5" max="3" step="0.1" aria-label="Tamano de fuente" className="w-full" value={markerFontSize} onChange={(event) => { const nextFontSize = Number(event.target.value); handleMarkerFontSizeChange(nextFontSize) }} disabled={markerToolsDisabled} />
                  <span className="w-12 text-right">{markerFontSize.toFixed(1)}rem</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {MARKER_COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Color ${color}`}
                      aria-pressed={areHexColorsEqual(markerColor, color)}
                      title={color}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${areHexColorsEqual(markerColor, color) ? 'border-primary/70 ring-2 ring-primary ring-offset-1 ring-offset-background' : 'border-foreground/20'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleMarkerColorChange(color)}
                      disabled={markerToolsDisabled}
                    >
                      {areHexColorsEqual(markerColor, color) && <Check className="h-3.5 w-3.5" style={{ color: getSwatchCheckColor(color) }} aria-hidden="true" />}
                    </button>
                  ))}
                  <Button type="button" variant="outline" size="icon" aria-label="Abrir selector de color" title="Abrir selector de color" className="size-8 shrink-0" onClick={() => setShowColorPicker((prev) => !prev)} disabled={markerToolsDisabled}><Palette className="h-4 w-4" aria-hidden="true" /></Button>
                  {showColorPicker && <input type="color" aria-label="Color personalizado" className="h-8 w-8 shrink-0 rounded border" value={markerColor} onChange={(event) => { handleMarkerColorChange(event.target.value) }} disabled={markerToolsDisabled} />}
                </div>
              </div>
            )}

            {showMixedControls && (
              <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-2">
                <div className="text-xs text-muted-foreground">Seleccion multiple: solo se muestran propiedades comunes.</div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {MARKER_COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Color ${color}`}
                      aria-pressed={areHexColorsEqual(markerColor, color)}
                      title={color}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${areHexColorsEqual(markerColor, color) ? 'border-primary/70 ring-2 ring-primary ring-offset-1 ring-offset-background' : 'border-foreground/20'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleMarkerColorChange(color)}
                      disabled={markerToolsDisabled}
                    >
                      {areHexColorsEqual(markerColor, color) && <Check className="h-3.5 w-3.5" style={{ color: getSwatchCheckColor(color) }} aria-hidden="true" />}
                    </button>
                  ))}
                  <Button type="button" variant="outline" size="icon" aria-label="Abrir selector de color" title="Abrir selector de color" className="size-8 shrink-0" onClick={() => setShowColorPicker((prev) => !prev)} disabled={markerToolsDisabled}><Palette className="h-4 w-4" aria-hidden="true" /></Button>
                  {showColorPicker && <input type="color" aria-label="Color personalizado" className="h-8 w-8 shrink-0 rounded border" value={markerColor} onChange={(event) => { handleMarkerColorChange(event.target.value) }} disabled={markerToolsDisabled} />}
                </div>
              </div>
            )}
          </div>
          {markerError && <div className="text-sm text-destructive">{markerError}</div>}
          {!markerReady && !markerError && <div className="text-sm text-muted-foreground">Cargando editor...</div>}
          <div className="relative min-h-[38dvh] flex-1 sm:min-h-[52vh]">
            <div ref={setMarkerAreaContainer} className="h-full w-full rounded border bg-background touch-none" />
            {isCropDialogOpen && (
              <div className="absolute inset-0 z-30 flex flex-col bg-background/95">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
                  <span className="text-sm font-medium">Recortar imagen</span>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCloseCrop} disabled={isApplyingCrop}>Cancelar</Button>
                    <Button type="button" variant="default" size="sm" onClick={handleApplyCrop} disabled={isApplyingCrop}>{isApplyingCrop ? 'Aplicando recorte...' : 'Aplicar recorte'}</Button>
                  </div>
                </div>
                <div className="flex-1 p-3">
                  <Cropper ref={cropperRef} src={cropSource} style={{ height: '100%', width: '100%' }} viewMode={1} dragMode="move" responsive autoCropArea={0.9} guides background={false} />
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSaveMarkerChanges} disabled={isEditSaveDisabled}>{isSavingAdjunto ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
