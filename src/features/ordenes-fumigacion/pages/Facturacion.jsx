import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import FacturaPendiente from "@/features/facturacion/components/FacturaPendiente";
import PagoPendiente from "@/features/facturacion/components/PagoPendiente";
import {
  useFacturacionMutation,
  useFacturacionQuery,
} from "@/features/facturacion/hooks/useFacturacionQuery";
import {
  mapFacturacionPayload,
  mapPagoFacturaPayload,
} from "@/features/facturacion/mappers/facturacionMappers";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";

const formatDisplayDate = (date) => format(date, "dd/MM/yyyy");

export default function Facturacion() {
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState(
    () => new Set(),
  );
  const [importesPorOrden, setImportesPorOrden] = useState({});
  const [nroOrdenClientePorOrden, setNroOrdenClientePorOrden] = useState({});
  const [nroFactura, setNroFactura] = useState("");
  const [modoPago, setModoPago] = useState(false);
  const [pagandoIds, setPagandoIds] = useState(() => new Set());
  const [dialogoEstanciaAbierto, setDialogoEstanciaAbierto] = useState(false);
  const [estanciaSeleccionada, setEstanciaSeleccionada] = useState(null);
  const [dialogoPagoAbierto, setDialogoPagoAbierto] = useState(false);
  const [facturaPagoSeleccionada, setFacturaPagoSeleccionada] = useState(null);
  const [fechaPago, setFechaPago] = useState();

  const { data: ordenesPorEstancia = [], isFetching: loading } =
    useFacturacionQuery(modoPago);
  const { facturarMutation, marcarFacturaPagadaMutation } =
    useFacturacionMutation();

  const cantidadSeleccionadas = ordenesSeleccionadas.size;

  const isFacturando = facturarMutation.isPending;
  const isPagando = marcarFacturaPagadaMutation.isPending;

  const importeEsValido = (importe) => /^\d+,\d{2}$/.test(importe);

  const tieneImportesInvalidos = useMemo(() => {
    return Array.from(ordenesSeleccionadas).some((ordenId) => {
      const importe = importesPorOrden[ordenId] ?? "";
      return !importeEsValido(importe);
    });
  }, [ordenesSeleccionadas, importesPorOrden]);

  const handleToggleOrden = (ordenId, nombreEstancia) => {
    setOrdenesSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(ordenId)) {
        next.delete(ordenId);
        setImportesPorOrden((prevImportes) => {
          const { [ordenId]: _removed, ...rest } = prevImportes;
          return rest;
        });
        setNroOrdenClientePorOrden((prevOrdenes) => {
          const { [ordenId]: _removed, ...rest } = prevOrdenes;
          return rest;
        });
        if (next.size === 0) {
          setEstanciaSeleccionada(null);
        }
      } else {
        if (
          !modoPago &&
          estanciaSeleccionada &&
          estanciaSeleccionada !== nombreEstancia
        ) {
          setDialogoEstanciaAbierto(true);
          return prev;
        }
        next.add(ordenId);
        if (!modoPago && !estanciaSeleccionada) {
          setEstanciaSeleccionada(nombreEstancia);
        }
      }
      return next;
    });
  };

  const handleImporteChange = (ordenId, value) => {
    setImportesPorOrden((prev) => ({
      ...prev,
      [ordenId]: value,
    }));
  };

  const handleNroOrdenClienteChange = (ordenId, value) => {
    setNroOrdenClientePorOrden((prev) => ({
      ...prev,
      [ordenId]: value,
    }));
  };

  const handleFacturar = async () => {
    const { ordenesIds, payload } = mapFacturacionPayload({
      ordenesSeleccionadas,
      importesPorOrden,
      nroOrdenClientePorOrden,
      nroFactura,
    });

    if (ordenesIds.length === 0) return;

    const response = await facturarMutation.mutateAsync(payload);
    if (!response?.ok) return;

    setOrdenesSeleccionadas(new Set());
    setImportesPorOrden({});
    setNroOrdenClientePorOrden({});
    setNroFactura("");
    setEstanciaSeleccionada(null);
  };

  const handleMarcarPagado = async (facturaId, fechaPagoSeleccionada) => {
    if (pagandoIds.has(facturaId)) return false;

    setPagandoIds((prev) => new Set(prev).add(facturaId));
    try {
      const response = await marcarFacturaPagadaMutation.mutateAsync(
        mapPagoFacturaPayload({
          facturaId,
          fechaPago: fechaPagoSeleccionada,
        }),
      );
      if (!response?.ok) return false;

      return true;
    } finally {
      setPagandoIds((prev) => {
        const next = new Set(prev);
        next.delete(facturaId);
        return next;
      });
    }
  };

  const handleAbrirDialogoPago = (facturaId) => {
    setFacturaPagoSeleccionada(facturaId);
    setFechaPago();
    setDialogoPagoAbierto(true);
  };

  const handleCerrarDialogoPago = () => {
    setDialogoPagoAbierto(false);
    setFacturaPagoSeleccionada(null);
    setFechaPago();
  };

  const handleConfirmarPago = async () => {
    if (!facturaPagoSeleccionada || !fechaPago) return;

    const responseOk = await handleMarcarPagado(
      facturaPagoSeleccionada,
      fechaPago,
    );

    if (responseOk) {
      handleCerrarDialogoPago();
    }
  };

  const pagoEnProceso =
    facturaPagoSeleccionada !== null && pagandoIds.has(facturaPagoSeleccionada);

  const parseImporte = (importe) => {
    if (importe === null || importe === undefined) return null;
    const raw = String(importe).trim();
    if (raw === "") return null;

    let normalized = raw;
    if (raw.includes(",") && raw.includes(".")) {
      normalized = raw.replace(/\./g, "").replace(",", ".");
    } else if (raw.includes(",")) {
      normalized = raw.replace(",", ".");
    }

    const numero = Number(normalized);
    if (Number.isNaN(numero)) return null;

    return numero;
  };

  const formatImporte = (importe) => {
    const numero = parseImporte(importe);
    if (numero === null) return "";

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(numero)
      .replace(/\s/g, "");
  };

  return (
    <div className="p-4 space-y-4">
      {modoPago ? (
        <PagoPendiente
          loading={loading}
          ordenesPorEstancia={ordenesPorEstancia}
          isPagando={isPagando}
          onAbrirDialogoPago={handleAbrirDialogoPago}
          onCambiarModo={setModoPago}
          parseImporte={parseImporte}
          formatImporte={formatImporte}
        />
      ) : (
        <FacturaPendiente
          loading={loading}
          ordenesPorEstancia={ordenesPorEstancia}
          cantidadSeleccionadas={cantidadSeleccionadas}
          nroFactura={nroFactura}
          isFacturando={isFacturando}
          tieneImportesInvalidos={tieneImportesInvalidos}
          ordenesSeleccionadas={ordenesSeleccionadas}
          importesPorOrden={importesPorOrden}
          nroOrdenClientePorOrden={nroOrdenClientePorOrden}
          onCambiarModo={setModoPago}
          onNroFacturaChange={setNroFactura}
          onFacturar={handleFacturar}
          onToggleOrden={handleToggleOrden}
          onImporteChange={handleImporteChange}
          onNroOrdenClienteChange={handleNroOrdenClienteChange}
          importeEsValido={importeEsValido}
        />
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
                  onSelect={setFechaPago}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCerrarDialogoPago}>
              Cerrar
            </Button>
            <Button
              onClick={handleConfirmarPago}
              disabled={!fechaPago || pagoEnProceso}
            >
              {pagoEnProceso ? "Marcando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialogoEstanciaAbierto}
        onOpenChange={setDialogoEstanciaAbierto}
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
              onClick={() => setDialogoEstanciaAbierto(false)}
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
