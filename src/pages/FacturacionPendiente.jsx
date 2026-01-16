import React, { useEffect, useState } from 'react'
import { getOrdenesPendientesFacturacion, facturarOrden } from '../services/ordenesFumigacionService'
import { Button } from '@/components/ui/button'
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

  const handleFacturar = async (ordenId) => {
    setFacturandoIds((prev) => new Set(prev).add(ordenId))
    try {
      const response = await facturarOrden(ordenId)
      if (!response?.ok) return

      setOrdenesPorEstancia((prev) =>
        prev
          .map((grupo) => ({
            ...grupo,
            data: grupo.data.filter((orden) => orden.orden_id !== ordenId),
          }))
          .filter(groupHasOrdenes)
      )
    } finally {
      setFacturandoIds((prev) => {
        const next = new Set(prev)
        next.delete(ordenId)
        return next
      })
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
                <div className="space-y-1">
                  <div className="font-semibold">Orden #{orden.orden_id}</div>
                  <div className="text-sm text-muted-foreground">Lote: {orden.lote_id}</div>
                  <div className="text-sm text-muted-foreground">Hectáreas: {orden.hectareas}</div>
                  <div className="text-sm text-muted-foreground">Fecha trabajo: {orden.fecha_trabajo}</div>
                  <div className="text-sm text-muted-foreground">Maquinista: {orden.maquinista}</div>
                </div>
                <Button
                  onClick={() => handleFacturar(orden.orden_id)}
                  disabled={facturandoIds.has(orden.orden_id)}
                >
                  {facturandoIds.has(orden.orden_id) ? 'Facturando...' : 'Facturar'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
