import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrdenesFumigacion } from '../services/ordenesFumigacionService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function OrdenesFumigacion() {
  const [ordenes, setOrdenes] = useState([])
  const navigate = useNavigate()
  const [estadoOrdenSeleccionada, setEstadoOrdenSeleccionada] = useState('activa')

  const fetchOrdenes = async () => {
    const data = await getOrdenesFumigacion(estadoOrdenSeleccionada)
    setOrdenes(data)
  }

  useEffect(() => {
    fetchOrdenes()
  }, [estadoOrdenSeleccionada])

  const handleEstadoOrdenes = async (estado) => {
    setEstadoOrdenSeleccionada(estado)
  }

  const handleVerOrden = (id) => {
    navigate(`/ordenes_fumigacion/${id}`)
  }

  const seleccionadoClass = (boton) => {
    if (boton === estadoOrdenSeleccionada) {
      return 'default'
    }
    return 'secondary'
  }

  const formatDate = (value) => {
    if (!value) return 'Sin fecha'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Sin fecha'
    return date.toLocaleDateString('es-AR')
  }

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

  const getEstadoVariant = (estado) => {
    const estadoNormalizado = (estado || '').toLowerCase()
    if (estadoNormalizado === 'activa') return 'destructive'
    if (estadoNormalizado === 'terminada') return 'success'
    return 'secondary'
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold">Órdenes de Fumigación</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-1 md:justify-center">
          <Button
            onClick={() => handleEstadoOrdenes('')}
            variant={seleccionadoClass('')}
          >
            Todas
          </Button>
          <Button
            onClick={() => handleEstadoOrdenes('activa')}
            variant={seleccionadoClass('activa')}
          >
            Activas
          </Button>
          <Button
            onClick={() => handleEstadoOrdenes('terminada')}
            variant={seleccionadoClass('terminada')}
          >
            Terminadas
          </Button>
        </div>

        <div className="flex md:flex-1 md:justify-end">
          <Button onClick={() => navigate('/ordenes_fumigacion/nueva')}>
            Crear Orden
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {ordenes.map((orden) => {
          const estadoOrden = (orden.estado_orden || '').toLowerCase()
          const estadoLabel = estadoOrden
            ? `${estadoOrden.charAt(0).toUpperCase()}${estadoOrden.slice(1)}`
            : 'Sin estado'
          const lotesOrden = Array.isArray(orden.lotes) ? orden.lotes : []
          const totalHectareas = lotesOrden.length > 0
            ? lotesOrden.reduce((acc, lote) => acc + Number(lote.hectareas ?? 0), 0)
            : (orden.hectareas ?? orden.temp_hectareas)
          const hectareasLabel = formatHectareas(totalHectareas)
          const isTerminada = estadoOrden === 'terminada'
          const createdAtLabel = formatDate(orden.created_at)

          return (
            <Card key={orden.id} className="w-full">
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 md:hidden">
                  <CardTitle className="text-lg">Orden #{orden.id}</CardTitle>
                  <Badge variant={getEstadoVariant(estadoOrden)}>{estadoLabel}</Badge>
                </div>
                <div className="text-sm text-muted-foreground md:hidden">
                  Creado: {createdAtLabel} por: {orden.creado_por || 'Sin datos'}
                </div>

                <div className="hidden items-center justify-between gap-4 md:flex">
                  <div className="flex flex-wrap items-center gap-4">
                    <CardTitle className="text-lg">#{orden.id}</CardTitle>
                    <span className="text-lg font-semibold">
                      {orden.nombre_estancia || 'Sin estancia'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Creado: {createdAtLabel} por: {orden.creado_por || 'Sin datos'}
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
                </div>

                <div>
                  {lotesOrden.length > 0 ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {lotesOrden.map((lote, loteIndex) => {
                        const loteHectareas = formatHectareas(lote.hectareas)
                        const loteKey = lote.id ?? lote.lote_id ?? `${orden.id}-${loteIndex}`
                        const dosisList = Array.isArray(lote.dosis) ? lote.dosis : []
                        const dosisValue = `dosis-${orden.id}-${loteKey}`

                        return (
                           <li key={loteKey} className="space-y-2">
                             <div className="flex flex-wrap gap-2">
                               <Badge variant="success">Lote: {lote.nombre || 'Sin nombre'}</Badge>
                               <Badge variant="outline">{loteHectareas}{loteHectareas === 'Sin datos' ? '' : ' ha'}</Badge>
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
                     <div className="flex flex-wrap gap-2">
                       <Badge variant="success">Lote: {orden.nombre_lote || orden.temp_lotes || 'Sin lotes'}</Badge>
                       <Badge variant="outline">{formatHectareas(orden.hectareas ?? orden.temp_hectareas)}{formatHectareas(orden.hectareas ?? orden.temp_hectareas) === 'Sin datos' ? '' : ' ha'}</Badge>
                     </div>
                   )}
                </div>

                 <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                   <Badge variant="outline">Total Hectareas: {hectareasLabel}</Badge>
                  {isTerminada ? (
                    <span>Terminado: {formatDate(orden.fecha_trabajo)}</span>
                  ) : null}
                  {isTerminada ? (
                    <span>Trabajó: {orden.maquinista || 'Sin datos'}</span>
                  ) : null}
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button onClick={() => handleVerOrden(orden.id)}>Ver orden</Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
