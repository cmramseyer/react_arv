import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/async-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import FacturaPendienteSkeleton from "@/features/facturacion/components/FacturaPendienteSkeleton";
import type { FacturacionGrupoPendiente, FacturacionOrdenPendiente } from "@/features/facturacion/types";
import { formatHectareas, parseHectareas } from "@/utils/formatHectareas";

type OrdenId = number | string;

type FacturaPendienteProps = {
  loading: boolean;
  ordenesPorEstancia: FacturacionGrupoPendiente[];
  cantidadSeleccionadas: number;
  nroFactura: string;
  isFacturando: boolean;
  tienePreciosInvalidos: boolean;
  ordenesSeleccionadas: Set<OrdenId>;
  preciosPorOrden: Record<OrdenId, string>;
  nroOrdenClientePorOrden: Record<OrdenId, string>;
  onCambiarModo: (checked: boolean) => void;
  onNroFacturaChange: (value: string) => void;
  onFacturar: () => void;
  onToggleOrden: (ordenId: OrdenId, nombreEstancia: string | undefined) => void;
  onPrecioChange: (ordenId: OrdenId, value: string) => void;
  onNroOrdenClienteChange: (ordenId: OrdenId, value: string) => void;
  precioEsValido: (precio: string) => boolean;
  dialogoEstanciaAbierto: boolean;
  onDialogoEstanciaOpenChange: (open: boolean) => void;
};

export default function FacturaPendiente({
  loading,
  ordenesPorEstancia,
  cantidadSeleccionadas,
  nroFactura,
  isFacturando,
  tienePreciosInvalidos,
  ordenesSeleccionadas,
  preciosPorOrden,
  nroOrdenClientePorOrden,
  onCambiarModo,
  onNroFacturaChange,
  onFacturar,
  onToggleOrden,
  onPrecioChange,
  onNroOrdenClienteChange,
  precioEsValido,
  dialogoEstanciaAbierto,
  onDialogoEstanciaOpenChange,
}: FacturaPendienteProps) {
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

      {loading && ordenesPorEstancia.length === 0 && (
        <FacturaPendienteSkeleton />
      )}

      {!loading && ordenesPorEstancia.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No hay órdenes pendientes de facturación.
        </div>
      )}

      {ordenesPorEstancia.length > 0 && (
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
              <AsyncButton
                onClick={onFacturar}
                isLoading={isFacturando}
                disabled={
                  cantidadSeleccionadas === 0 ||
                   tienePreciosInvalidos
                }
              >
                Facturar
              </AsyncButton>
            </div>
          </div>

          {ordenesPorEstancia.map((grupo, index) => {
            const datos = Array.isArray(grupo?.data) ? grupo.data : [];
            const ordenes = datos.reduce<FacturacionOrdenPendiente[]>(
              (acumuladas, orden) => {
                const existente = acumuladas.find((item) => item.orden_id === orden.orden_id);
                const hectareas = parseHectareas(orden.hectareas) ?? 0;

                if (existente) {
                  existente.hectareas = (parseHectareas(existente.hectareas) ?? 0) + hectareas;
                  existente.lote_id = `${existente.lote_id}, ${orden.lote_id}`;
                  return acumuladas;
                }

                acumuladas.push({ ...orden, hectareas });
                return acumuladas;
              },
              [],
            );

            return (
              <Card key={grupo.id ?? grupo.nombre ?? index} className="w-full">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle>{grupo.nombre}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ordenes.map((orden) => (
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
                                   Precio
                                </span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0,00"
                                  value={preciosPorOrden[orden.orden_id] ?? ""}
                                  onChange={(event) =>
                                    onPrecioChange(
                                      orden.orden_id,
                                      event.target.value,
                                    )
                                  }
                                  className={`h-9 w-28 rounded-md border px-2 text-sm ${
                                     precioEsValido(
                                       preciosPorOrden[orden.orden_id] ?? "",
                                    )
                                      ? "border-input"
                                      : "border-destructive"
                                  }`}
                                  aria-label={`Precio de orden ${orden.orden_id}`}
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
      <Dialog
        open={dialogoEstanciaAbierto}
        onOpenChange={onDialogoEstanciaOpenChange}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              No se puede crear una factura con órdenes de diferentes
              propietarios
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onDialogoEstanciaOpenChange(false)}
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
