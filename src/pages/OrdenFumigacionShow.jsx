import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getOrdenFumigacion,
  deleteOrdenFumigacion,
  imprimirOrdenFumigacion,
  getAdjuntosOrden,
} from '../services/ordenesFumigacionService'

import { 
  useOrdenFumigacionQuery,
  useOrdenFumigacionAdjuntosQuery,
  useOrdenFumigacionImprimirQuery,
  useOrdenFumigacionMutation
} from '../hooks/useOrdenFumigacionQuery'

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
import { formatHectareas } from '../utils/formatHectareas'
import OrdenFumigacionInfoBadges from '@/components/OrdenFumigacionInfoBadges'
import DialogEditAdjunto from '@/components/DialogEditAdjunto'

const PDF_FILENAME_REGEX = /\.pdf$/i
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

export default function OrdenFumigacionShow() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [pdfUrl, setPdfUrl] = useState(null)
  const [fechaPdf, setFechaPdf] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // const [adjuntos, setAdjuntos] = useState([])
  const [selectedAdjuntos, setSelectedAdjuntos] = useState(new Set())
  const [isLoadingAdjuntos, setIsLoadingAdjuntos] = useState(false)
  const [adjuntoEnEdicion, setAdjuntoEnEdicion] = useState(null)
  const [adjuntoEditando, setAdjuntoEditando] = useState(null)

  const ordenFumigacionQuery = useOrdenFumigacionQuery(id)
  const ordenFumigacionAdjuntosQuery = useOrdenFumigacionAdjuntosQuery(id, false)
  const ordenFumigacionImprimirQuery = useOrdenFumigacionImprimirQuery(id, false)

  const orden = ordenFumigacionQuery.data || null

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
      const adjuntosQuery = await ordenFumigacionAdjuntosQuery.refetch()
      const data = adjuntosQuery.data || []
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
  }

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
  const selectedAdjuntosArray = Array.from(selectedAdjuntos)
  const isSavingAdjunto = adjuntoEnEdicion !== null
  const labelImprimirSeleccion = selectedAdjuntosArray.length > 0
    ? "Imprimir con planos"
    : "Imprimir sin planos"

  const lotesOrden = Array.isArray(orden?.lotes) && orden.lotes.length > 0
    ? orden.lotes
    : []
  const facturasOrden = Array.isArray(orden?.facturas) ? orden.facturas : []



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

        <OrdenFumigacionInfoBadges orden={orden} />

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
            {ordenFumigacionAdjuntosQuery.isFetching && (
              <div className="text-sm text-muted-foreground">Cargando adjuntos...</div>
            )}
            {!ordenFumigacionAdjuntosQuery.isFetching && !ordenFumigacionAdjuntosQuery.data && (
              <div className="text-sm text-muted-foreground">No hay adjuntos disponibles.</div>
            )}
            {!ordenFumigacionAdjuntosQuery.isFetching && ordenFumigacionAdjuntosQuery.data && (
              <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {ordenFumigacionAdjuntosQuery.data.map((adjunto) => (
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
                        disabled={isSavingAdjunto || Boolean(adjuntoEditando) || !isImageAdjunto(adjunto)}
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
      <DialogEditAdjunto
        ordenId={id}
        adjunto={adjuntoEditando}
        onClose={() => setAdjuntoEditando(null)}
        onSaved={(updatedOrden) => applyOrdenResponse(updatedOrden, { preserveSelection: true })}
        onSavingChange={setAdjuntoEnEdicion}
      />
    </Card>

  )
}
