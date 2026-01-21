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

  const formatHectareas = (value) => {
    if (value === null || value === undefined || value === '') return 'Sin datos'
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) return 'Sin datos'
    return numericValue.toLocaleString('es-AR', { maximumFractionDigits: 2 })
  }

  const formatCantidad = (value) => {
    if (value === null || value === undefined || value === '') return 'Sin datos'
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) return 'Sin datos'
    return numericValue.toLocaleString('es-AR', { maximumFractionDigits: 2 })
  }

  const botonVerPdf = !!pdfUrl && (
    <Button onClick={handleVerPdf} variant="default">
      Ver Pdf
    </Button>
  )

  if (!orden) {
    return <div className="p-4">Cargando...</div>
  }

  return (

    <Card className="w-full">
      <CardHeader>
        <CardTitle>#{orden.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Estancia: {orden.nombre_estancia}</div>
        <div>Estado: {orden.estado_orden}</div>
        <div>Creado por: {orden.creado_por}</div>
        <div className="hidden md:block">Fecha trabajo: {orden.fecha_trabajo || 'Pendiente'}</div>
        <p><strong>Fecha de Creación:</strong> {new Date(orden.created_at).toLocaleString()}</p>
        <p><strong>Maquinista:</strong> {orden.maquinista}</p>
        <p><strong>Info Trabajo:</strong> {orden.info_trabajo}</p>
        <p><strong>Datos Clima:</strong> {orden.datos_clima}</p>
        <p><strong>PDF creado:</strong> {fechaPdf || orden.orden_pdf_fecha_creacion}</p>
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
                    {loteHectareas === 'Sin datos' ? '' : ' ha'}
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
              {formatHectareas(orden.hectareas || orden.temp_hectareas) === 'Sin datos' ? '' : ' ha'}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleEditar} variant="default">Editar</Button>
        <Button onClick={handleTerminar} variant="default">Terminar</Button>
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
