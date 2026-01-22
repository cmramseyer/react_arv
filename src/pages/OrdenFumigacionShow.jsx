import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getOrdenFumigacion,
  deleteOrdenFumigacion,
  imprimirOrdenFumigacion,
  getAdjuntosOrden,
} from '../services/ordenesFumigacionService'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
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

  useEffect(()=> {
    getOrdenFumigacion(id).then((data) => {
      setOrden(data)
      setPdfUrl(data.orden_url)
      setFechaPdf(data.orden_pdf_fecha_creacion)
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

  const fetchAdjuntos = async () => {
    setIsLoadingAdjuntos(true)
    try {
      const data = await getAdjuntosOrden(id)
      setAdjuntos(Array.isArray(data) ? data : [])
      setSelectedAdjuntos(new Set())
    } finally {
      setIsLoadingAdjuntos(false)
    }
  }

  const handleGenerarPdf = async () => {
    setIsDialogOpen(true)
    fetchAdjuntos()
  }

  const handleToggleAdjunto = (adjuntoId) => {
    setSelectedAdjuntos((prev) => {
      const next = new Set(prev)
      if (next.has(adjuntoId)) {
        next.delete(adjuntoId)
      } else {
        next.add(adjuntoId)
      }
      return next
    })
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

  const labelGenerarPdf = !!pdfUrl ? "Regenerar PDF" : "Generar PDF"
  const hasAdjuntos = adjuntos.length > 0
  const selectedAdjuntosArray = Array.from(selectedAdjuntos)
  const labelImprimirSeleccion = selectedAdjuntosArray.length > 0
    ? "Imprimir con planos"
    : "Imprimir sin planos"

  const lotesOrden = Array.isArray(orden?.lotes) && orden.lotes.length > 0
    ? orden.lotes
    : []

  const formatDate = (value) => {
    if (!value) return 'Sin fecha'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Sin fecha'
    return date.toLocaleDateString('es-AR')
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
    : (orden.hectareas ?? orden.temp_hectareas)
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
               <span className="text-sm font-medium">
                 Cultivo: {orden.cultivo.nombre}
               </span>
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
             <div className="text-sm text-muted-foreground">
               Cultivo: {orden.cultivo.nombre}
             </div>
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
              Lote {orden.nombre_lote || orden.temp_lotes || 'Sin lote'}: {formatHectareas(orden.hectareas || orden.temp_hectareas)}
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
              <span>Fecha de trabajo: {orden.fecha_trabajo_ddmmyyyy || 'Sin fecha'}</span>
               <span>Trabajó: {orden.maquinista?.nombre || 'Sin datos'}</span>
            </div>
            <div>Comentario de trabajo: {orden.info_trabajo || 'Sin datos'}</div>
            <div>Datos del clima: {orden.datos_clima || 'Sin datos'}</div>
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
      </CardFooter>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjuntos para PDF</DialogTitle>
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
                  <label
                    key={adjunto.id}
                    className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/40">
                    <Checkbox
                      checked={selectedAdjuntos.has(adjunto.id)}
                      onCheckedChange={() => handleToggleAdjunto(adjunto.id)}
                    />
                    <img
                      src={adjunto.url}
                      alt={adjunto.filename}
                      className="h-16 w-20 rounded object-cover"
                    />
                    <span className="text-sm font-medium">{adjunto.filename}</span>
                  </label>
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
            >
              {labelImprimirSeleccion}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>

  )
}
