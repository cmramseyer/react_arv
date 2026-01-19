import React, { useEffect, useMemo, useState } from 'react'
import { getOrdenesPendientesFacturacion, facturarOrdenes } from '../services/ordenesFumigacionService'
import { getFacturasPago, marcarFacturaPagada } from '../services/facturasService'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const groupHasOrdenes = (grupo) => Array.isArray(grupo?.data) && grupo.data.length > 0

const normalizarRespuesta = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.data)) return data.data.data
  return []
}

export default function FacturacionPendiente() {
  const [ordenesPorEstancia, setOrdenesPorEstancia] = useState([])
  const [loading, setLoading] = useState(true)
  const [facturandoIds, setFacturandoIds] = useState(() => new Set())
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState(() => new Set())
  const [importesPorOrden, setImportesPorOrden] = useState({})
  const [modoPago, setModoPago] = useState(false)
  const [pagandoIds, setPagandoIds] = useState(() => new Set())

  useEffect(() => {
    const fetchOrdenes = async () => {
      setLoading(true)
      try {
        if (modoPago) {
          const data = await getFacturasPago()
          setOrdenesPorEstancia(normalizarRespuesta(data))
        } else {
          const data = await getOrdenesPendientesFacturacion()
          setOrdenesPorEstancia(normalizarRespuesta(data))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrdenes()
  }, [modoPago])

  const cantidadSeleccionadas = useMemo(
    () => ordenesSeleccionadas.size,
    [ordenesSeleccionadas]
  )

  const importeEsValido = (importe) => /^\d+,\d{2}$/.test(importe)

  const tieneImportesInvalidos = useMemo(() => {
    return Array.from(ordenesSeleccionadas).some((ordenId) => {
      const importe = importesPorOrden[ordenId] ?? ''
      return !importeEsValido(importe)
    })
  }, [ordenesSeleccionadas, importesPorOrden])

  const handleToggleOrden = (ordenId) => {
    setOrdenesSeleccionadas((prev) => {
      const next = new Set(prev)
      if (next.has(ordenId)) {
        next.delete(ordenId)
        setImportesPorOrden((prevImportes) => {
          const { [ordenId]: _removed, ...rest } = prevImportes
          return rest
        })
      } else {
        next.add(ordenId)
      }
      return next
    })
  }

  const handleImporteChange = (ordenId, value) => {
    setImportesPorOrden((prev) => ({
      ...prev,
      [ordenId]: value,
    }))
  }

  const handleFacturar = async () => {
    const ordenesIds = Array.from(ordenesSeleccionadas)
    if (ordenesIds.length === 0) return

    const ordenesPayload = ordenesIds.map((ordenId) => {
      const importeTexto = importesPorOrden[ordenId] ?? '0,00'
      const importe = Number(importeTexto.replace(',', '.'))
      return { id: ordenId, importe }
    })

    setFacturandoIds(new Set(ordenesIds))
    try {
      const response = await facturarOrdenes(ordenesPayload)
      if (!response?.ok) return

      setOrdenesPorEstancia((prev) =>
        prev
          .map((grupo) => ({
            ...grupo,
            data: (Array.isArray(grupo.data) ? grupo.data : []).filter(
              (orden) => !ordenesSeleccionadas.has(orden.orden_id)
            ),
          }))
          .filter(groupHasOrdenes)
      )
      setOrdenesSeleccionadas(new Set())
      setImportesPorOrden({})
    } finally {
      setFacturandoIds(new Set())
    }
  }

  const handleMarcarPagado = async (facturaId) => {
    if (pagandoIds.has(facturaId)) return

    setPagandoIds((prev) => new Set(prev).add(facturaId))
    try {
      const response = await marcarFacturaPagada(facturaId)
      if (!response?.ok) return

      setOrdenesPorEstancia((prev) => prev.filter((grupo) => grupo.id !== facturaId))
    } finally {
      setPagandoIds((prev) => {
        const next = new Set(prev)
        next.delete(facturaId)
        return next
      })
    }
  }

  const emptyMessage = modoPago
    ? 'No hay facturas pendientes de pago.'
    : 'No hay órdenes pendientes de facturación.'

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Facturación Pendiente</h2>
          <p className="text-sm text-muted-foreground">
            {modoPago ? 'Facturas pendientes de pago' : 'Órdenes pendientes de facturación'}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <span>Pago</span>
          <Switch checked={modoPago} onCheckedChange={setModoPago} aria-label="Cambiar modo" />
        </label>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Cargando {modoPago ? 'facturas para pago' : 'facturación pendiente'}...
        </div>
      )}

      {!loading && ordenesPorEstancia.length === 0 && (
        <div className="text-sm text-muted-foreground">{emptyMessage}</div>
      )}

      {!loading && ordenesPorEstancia.length > 0 && (
        <>
          {!modoPago && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {cantidadSeleccionadas} ordenes seleccionadas
              </div>
              <Button
                onClick={handleFacturar}
                disabled={cantidadSeleccionadas === 0 || facturandoIds.size > 0 || tieneImportesInvalidos}
              >
                {facturandoIds.size > 0 ? 'Facturando...' : 'Facturar'}
              </Button>
            </div>
          )}

          {ordenesPorEstancia.map((grupo, index) => {
            const datos = modoPago
              ? Array.isArray(grupo?.ordenes_fumigacion)
                ? grupo.ordenes_fumigacion
                : []
              : Array.isArray(grupo?.data)
                ? grupo.data
                : []

            return (
              <Card key={grupo.id ?? grupo.nombre ?? index} className="w-full">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle>
                      {modoPago ? `Factura #${grupo.id}` : grupo.nombre}
                    </CardTitle>
                    <CardDescription>
                      {modoPago ? 'Facturas pendientes de pago' : 'Órdenes pendientes'}
                    </CardDescription>
                    {modoPago && grupo.fecha_factura && (
                      <div className="text-sm text-muted-foreground">
                        Fecha factura: {grupo.fecha_factura}
                      </div>
                    )}
                  </div>
                  {modoPago && (
                    <Button
                      onClick={() => handleMarcarPagado(grupo.id)}
                      disabled={pagandoIds.has(grupo.id)}
                    >
                      {pagandoIds.has(grupo.id) ? 'Marcando...' : 'Pagado'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {datos.map((orden) => (
                    <div
                      key={`${grupo.id ?? grupo.nombre ?? index}-${orden.orden_id ?? orden.id ?? orden.lote_id}`}
                      className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                        {!modoPago && (
                          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                            <label className="flex items-center gap-2">
                              <Checkbox
                                checked={ordenesSeleccionadas.has(orden.orden_id)}
                                onCheckedChange={() => handleToggleOrden(orden.orden_id)}
                                disabled={facturandoIds.has(orden.orden_id)}
                                aria-label={`Seleccionar orden ${orden.orden_id}`}
                              />
                              <span>Seleccionar</span>
                            </label>
                            {ordenesSeleccionadas.has(orden.orden_id) && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Importe</span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0,00"
                                  value={importesPorOrden[orden.orden_id] ?? ''}
                                  onChange={(event) => handleImporteChange(orden.orden_id, event.target.value)}
                                  className={`h-9 w-28 rounded-md border px-2 text-sm ${
                                    importeEsValido(importesPorOrden[orden.orden_id] ?? '')
                                      ? 'border-input'
                                      : 'border-destructive'
                                  }`}
                                  aria-label={`Importe de orden ${orden.orden_id}`}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {modoPago ? `Orden #${orden.id}` : `Orden #${orden.orden_id}`}
                          </div>
                          {!modoPago && (
                            <>
                              <div className="text-sm text-muted-foreground">Lote: {orden.lote_id}</div>
                              <div className="text-sm text-muted-foreground">Hectáreas: {orden.hectareas}</div>
                              <div className="text-sm text-muted-foreground">Fecha trabajo: {orden.fecha_trabajo}</div>
                              <div className="text-sm text-muted-foreground">Maquinista: {orden.maquinista}</div>
                            </>
                          )}
                          {modoPago && (
                            <div className="text-sm text-muted-foreground">
                              Estancia: {orden.nombre_estancia}
                            </div>
                          )}
                        </div>
                      </div>
                      {modoPago && Array.isArray(orden.lotes) && orden.lotes.length > 0 && (
                        <div className="rounded-md border bg-muted/40 p-3 text-sm">
                          <div className="font-medium">Lotes</div>
                          <div className="mt-2 space-y-2">
                            {orden.lotes.map((lote, loteIndex) => (
                              <div key={`${orden.id}-lote-${loteIndex}`} className="flex flex-col gap-1">
                                {Object.entries(lote).map(([key, value]) => (
                                  <div key={`${orden.id}-lote-${loteIndex}-${key}`} className="text-muted-foreground">
                                    {key}: {value}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}
