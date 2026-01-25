import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import formatHectareas from '../utils/formatHectareas'

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

const formatDate = (value) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleDateString('es-AR')
}

export default function OrdenFumigacionCard({ orden, onVerOrden }) {
  const estadoOrden = (orden.estado_orden || '').toLowerCase()
  const estadoLabel = estadoOrden
    ? `${estadoOrden.charAt(0).toUpperCase()}${estadoOrden.slice(1)}`
    : 'Sin estado'
  const lotesOrden = Array.isArray(orden.lotes) ? orden.lotes : []
  const totalHectareas = lotesOrden.length > 0
    ? lotesOrden.reduce((acc, lote) => acc + Number(lote.hectareas ?? 0), 0)
    : (orden.hectareas ?? orden.hectareas_reales)
  const hectareasLabel = formatHectareas(totalHectareas)
  const isTerminada = estadoOrden === 'terminada'
  const createdAtLabel = orden.created_at_locale || 'Sin fecha'
  const facturasOrden = Array.isArray(orden.facturas) ? orden.facturas : []

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
            <CardTitle className="text-lg">#{orden.id}</CardTitle>
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
                      <Badge variant="outline">{loteHectareas}</Badge>
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
              <Badge variant="outline">{formatHectareas(orden.hectareas ?? orden.hectareas_reales)}</Badge>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="outline">Total Hectareas: {hectareasLabel}</Badge>
          {isTerminada ? (
            <span>Terminado: {orden.fecha_trabajo_ddmmyyyy || 'Sin fecha'}</span>
          ) : null}
          {isTerminada ? (
            <span>Trabajó: {orden.maquinista?.nombre || 'Sin datos'}</span>
          ) : null}
        </div>

        {facturasOrden.length > 0 ? (
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="text-sm font-medium text-foreground">Facturas</div>
            <ul className="space-y-1">
              {facturasOrden.map((factura, facturaIndex) => (
                <li key={`${orden.id}-factura-${facturaIndex}`}>
                  {factura.nro_factura || 'Sin nro'} / {factura.nro_orden_cliente || 'Sin orden'} / {formatDate(factura.fecha_factura)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={() => onVerOrden(orden.id)}>Ver orden</Button>
      </CardFooter>
    </Card>
  )
}
