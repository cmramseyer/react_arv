import React from "react"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { formatHectareas } from "@/utils/formatHectareas";

export default function FacturaPendiente({
  loading,
  ordenesPorEstancia,
  cantidadSeleccionadas,
  nroFactura,
  isFacturando,
  tieneImportesInvalidos,
  ordenesSeleccionadas,
  importesPorOrden,
  nroOrdenClientePorOrden,
  onCambiarModo,
  onNroFacturaChange,
  onFacturar,
  onToggleOrden,
  onImporteChange,
  onNroOrdenClienteChange,
  importeEsValido,
}) {
  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Órdenes pendiente de facturar</h2>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <span>Ver facturas pendientes de pago</span>
          <Switch
            checked={false}
            onCheckedChange={onCambiarModo}
            aria-label="Cambiar modo"
          />
        </label>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Cargando facturación pendiente...
        </div>
      )}

      {!loading && ordenesPorEstancia.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No hay órdenes pendientes de facturación.
        </div>
      )}

      {!loading && ordenesPorEstancia.length > 0 && (
        <>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {cantidadSeleccionadas} ordenes seleccionadas
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Nro Factura</span>
                <input
                  type="text"
                  placeholder="Ej: FAC-2026-001"
                  value={nroFactura}
                  onChange={(event) => onNroFacturaChange(event.target.value)}
                  className="h-9 w-40 rounded-md border border-input px-2 text-sm"
                  aria-label="Nro factura"
                />
              </div>
              <Button
                onClick={onFacturar}
                disabled={
                  cantidadSeleccionadas === 0 ||
                  isFacturando ||
                  tieneImportesInvalidos
                }
              >
                {isFacturando ? "Facturando..." : "Facturar"}
              </Button>
            </div>
          </div>

          {ordenesPorEstancia.map((grupo, index) => {
            const datos = Array.isArray(grupo?.data) ? grupo.data : [];

            return (
              <Card key={grupo.id ?? grupo.nombre ?? index} className="w-full">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle>{grupo.nombre}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {datos.map((orden) => (
                    <div
                      key={`${grupo.id ?? grupo.nombre ?? index}-${orden.orden_id ?? orden.lote_id}`}
                      className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={ordenesSeleccionadas.has(orden.orden_id)}
                              onCheckedChange={() =>
                                onToggleOrden(
                                  orden.orden_id,
                                  orden.nombre_estancia ?? grupo.nombre,
                                )
                              }
                              disabled={isFacturando}
                              aria-label={`Seleccionar orden ${orden.orden_id}`}
                            />
                          </label>
                          {ordenesSeleccionadas.has(orden.orden_id) && (
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Importe
                                </span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0,00"
                                  value={importesPorOrden[orden.orden_id] ?? ""}
                                  onChange={(event) =>
                                    onImporteChange(
                                      orden.orden_id,
                                      event.target.value,
                                    )
                                  }
                                  className={`h-9 w-28 rounded-md border px-2 text-sm ${
                                    importeEsValido(
                                      importesPorOrden[orden.orden_id] ?? "",
                                    )
                                      ? "border-input"
                                      : "border-destructive"
                                  }`}
                                  aria-label={`Importe de orden ${orden.orden_id}`}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Nro Orden Cliente
                                </span>
                                <input
                                  type="text"
                                  placeholder="Ej: ORD-100"
                                  value={
                                    nroOrdenClientePorOrden[orden.orden_id] ?? ""
                                  }
                                  onChange={(event) =>
                                    onNroOrdenClienteChange(
                                      orden.orden_id,
                                      event.target.value,
                                    )
                                  }
                                  className="h-9 w-36 rounded-md border border-input px-2 text-sm"
                                  aria-label={`Nro orden cliente ${orden.orden_id}`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold">{`Orden #${orden.orden_id}`}</div>
                          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
                            <div className="text-sm text-muted-foreground">
                              Lote: {orden.lote_id}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Hectáreas: {formatHectareas(orden.hectareas)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Fecha trabajo: {orden.fecha_trabajo_ddmmyyyy || "Sin fecha"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Maquinista: {orden.maquinista}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </>
  );
}
