import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatHectareas } from "@/utils/formatHectareas";

const formatDisplayDate = (date) => format(date, "dd/MM/yyyy");

export default function PagoPendiente({
  loading,
  ordenesPorEstancia,
  isPagando,
  onAbrirDialogoPago,
  onCambiarModo,
  parseImporte,
  formatImporte,
  dialogoPagoAbierto,
  fechaPago,
  pagoEnProceso,
  onFechaPagoChange,
  onCerrarDialogoPago,
  onConfirmarPago,
}) {
  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Facturas pendiente de pago</h2>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <span>Ver ordenes pendiente de facturar</span>
          <Switch
            checked
            onCheckedChange={onCambiarModo}
            aria-label="Cambiar modo"
          />
        </label>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Cargando facturas para pago...
        </div>
      )}

      {!loading && ordenesPorEstancia.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No hay facturas pendientes de pago.
        </div>
      )}

      {!loading && ordenesPorEstancia.length > 0 && (
        <>
          {ordenesPorEstancia.map((grupo, index) => {
            const datos = Array.isArray(grupo?.ordenes_fumigacion)
              ? grupo.ordenes_fumigacion
              : [];

            const totalImporte = datos.reduce((acc, orden) => {
              const valor = parseImporte(orden?.importe);
              return valor === null ? acc : acc + valor;
            }, 0);

            return (
              <Card key={grupo.id ?? grupo.nombre ?? index} className="w-full">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle>{`Factura #${grupo.id}`}</CardTitle>

                    <div className="text-sm text-muted-foreground">
                      Fecha factura: {grupo.fecha_factura_ddmmyyyy || "Sin fecha"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Importe total: {formatImporte(totalImporte)}
                    </div>
                    {grupo.nro_factura && (
                      <div className="text-sm text-muted-foreground">
                        Nro factura: {grupo.nro_factura}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => onAbrirDialogoPago(grupo.id)}
                    disabled={isPagando}
                  >
                    {isPagando
                      ? "Marcando..."
                      : "Marcar como pagado"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {datos.map((orden) => (
                    <div
                      key={`${grupo.id ?? grupo.nombre ?? index}-${orden.id ?? orden.lote_id}`}
                      className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                        <div className="space-y-1">
                          <div className="font-semibold">{`Orden #${orden.id}`}</div>
                          <div className="text-sm text-muted-foreground">
                            Estancia: {orden.nombre_estancia}
                          </div>
                          {orden.nro_orden_cliente && (
                            <div className="text-sm text-muted-foreground">
                              Nro orden cliente: {orden.nro_orden_cliente}
                            </div>
                          )}
                        </div>
                      </div>
                      {Array.isArray(orden.lotes) && orden.lotes.length > 0 && (
                        <div className="rounded-md border bg-muted/40 p-3 text-sm">
                          <div className="font-medium">Lotes</div>
                          <div className="mt-2 space-y-2">
                            {orden.lotes.map((lote, loteIndex) => (
                              <div
                                key={`${orden.id}-lote-${loteIndex}`}
                                className="flex flex-col gap-1"
                              >
                                {Object.entries(lote).map(([key, value]) => {
                                  const displayValue =
                                    key === "hectareas"
                                      ? formatHectareas(value)
                                      : value;

                                  return (
                                    <div
                                      key={`${orden.id}-lote-${loteIndex}-${key}`}
                                      className="text-muted-foreground"
                                    >
                                      {key}: {displayValue}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
      <Dialog open={dialogoPagoAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <span className="text-sm font-medium">Fecha de pago</span>
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaPago && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaPago
                    ? formatDisplayDate(fechaPago)
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaPago}
                  onSelect={onFechaPagoChange}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onCerrarDialogoPago}>
              Cerrar
            </Button>
            <Button
              onClick={onConfirmarPago}
              disabled={!fechaPago || pagoEnProceso}
            >
              {pagoEnProceso ? "Marcando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
