import React, { useEffect, useMemo, useState } from 'react'
import { getOrdenesPendientesFacturacion, facturarOrdenes } from '../services/ordenesFumigacionService'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const groupHasOrdenes = (grupo) => Array.isArray(grupo?.data) && grupo.data.length > 0

export default function FacturacionPendiente() {
  const [ordenesPorEstancia, setOrdenesPorEstancia] = useState([])
  const [loading, setLoading] = useState(true)
  const [facturandoIds, setFacturandoIds] = useState(() => new Set())
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState(() => new Set())

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const data = await getOrdenesPendientesFacturacion()
        setOrdenesPorEstancia(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
    }

    fetchOrdenes()
  }, [])

  const cantidadSeleccionadas = useMemo(
    () => ordenesSeleccionadas.size,
    [ordenesSeleccionadas]
  )

  const handleToggleOrden = (ordenId) => {
    setOrdenesSeleccionadas((prev) => {
      const next = new Set(prev)
      if (next.has(ordenId)) {
        next.delete(ordenId)
      } else {
        next.add(ordenId)
      }
      return next
    })
  }

  const handleFacturar = async () => {
    const ordenesIds = Array.from(ordenesSeleccionadas)
    if (ordenesIds.length === 0) return

    setFacturandoIds(new Set(ordenesIds))
    try {
      const response = await facturarOrdenes(ordenesIds)
      if (!response?.ok) return

      setOrdenesPorEstancia((prev) =>
        prev
          .map((grupo) => ({
            ...grupo,
            data: grupo.data.filter((orden) => !ordenesSeleccionadas.has(orden.orden_id)),
          }))
          .filter(groupHasOrdenes)
      )
      setOrdenesSeleccionadas(new Set())
    } finally {
      setFacturandoIds(new Set())
    }
  }

  if (loading) {
    return <div className="p-4">Cargando facturación pendiente...</div>
  }

  if (ordenesPorEstancia.length === 0) {
    return <div className="p-4">No hay órdenes pendientes de facturación.</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Facturación Pendiente</h2>
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {cantidadSeleccionadas} ordenes seleccionadas
        </div>
        <Button
          onClick={handleFacturar}
          disabled={cantidadSeleccionadas === 0 || facturandoIds.size > 0}
        >
          {facturandoIds.size > 0 ? 'Facturando...' : 'Facturar'}
        </Button>
      </div>

      {ordenesPorEstancia.map((grupo) => (
        <Card key={grupo.nombre} className="w-full">
          <CardHeader>
            <CardTitle>{grupo.nombre}</CardTitle>
            <CardDescription>Órdenes pendientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {grupo.data.map((orden) => (
              <div
                key={`${orden.orden_id}-${orden.lote_id}`}
                className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      checked={ordenesSeleccionadas.has(orden.orden_id)}
                      onCheckedChange={() => handleToggleOrden(orden.orden_id)}
                      disabled={facturandoIds.has(orden.orden_id)}
                      aria-label={`Seleccionar orden ${orden.orden_id}`}
                    />
                    <span>Seleccionar</span>
                  </label>
                  <div className="space-y-1">
                    <div className="font-semibold">Orden #{orden.orden_id}</div>
                    <div className="text-sm text-muted-foreground">Lote: {orden.lote_id}</div>
                    <div className="text-sm text-muted-foreground">Hectáreas: {orden.hectareas}</div>
                    <div className="text-sm text-muted-foreground">Fecha trabajo: {orden.fecha_trabajo}</div>
                    <div className="text-sm text-muted-foreground">Maquinista: {orden.maquinista}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
