import { useMemo, useState } from "react";
import FacturaPendiente from "@/features/facturacion/components/FacturaPendiente";
import PagoPendiente from "@/features/facturacion/components/PagoPendiente";
import {
  useFacturacionMutation,
  useFacturasPagoQuery,
  useOrdenesPendientesFacturacionQuery,
} from "@/features/facturacion/hooks/useFacturacionQuery";
import {
  mapFacturacionPayload,
  mapPagoFacturaPayload,
} from "@/features/facturacion/mappers/facturacionMappers";
import {
  formatImporte,
  importeEsValido,
  parseHectareas,
  parseImporte,
} from "@/utils/formatHectareas";

type LalaOrdenPrecio = {
  [ordenId: number | string]: string
}

type LalaOrdenNroOrdenCliente = {
  [ordenId: number | string]: string
}

export default function Facturacion() {
  const preciosOrden: LalaOrdenPrecio = {}
  const ordenesNroOrdenCliente: LalaOrdenNroOrdenCliente = {}
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState(
    () => new Set<number | string>(),
  );
  const [preciosPorOrden, setPreciosPorOrden] = useState(preciosOrden);
  const [nroOrdenClientePorOrden, setNroOrdenClientePorOrden] = useState(ordenesNroOrdenCliente);
  const [nroFactura, setNroFactura] = useState("");
  const [modoPago, setModoPago] = useState(false);
  const [dialogoEstanciaAbierto, setDialogoEstanciaAbierto] = useState(false);
  const [estanciaSeleccionada, setEstanciaSeleccionada] = useState(null);
  const [dialogoPagoAbierto, setDialogoPagoAbierto] = useState(false);
  const [facturaPagoSeleccionada, setFacturaPagoSeleccionada] = useState(null);
  const [fechaPago, setFechaPago] = useState<Date | undefined>(undefined);

  const ordenesPendientesQuery = useOrdenesPendientesFacturacionQuery(!modoPago);
  const facturasPagoQuery = useFacturasPagoQuery(modoPago);
  const { facturarMutation, marcarFacturaPagadaMutation } =
    useFacturacionMutation();

  const ordenesPendientes = ordenesPendientesQuery.data ?? [];
  const facturasPago = facturasPagoQuery.data ?? [];
  const loading = modoPago
    ? facturasPagoQuery.isFetching
    : ordenesPendientesQuery.isFetching;

  const cantidadSeleccionadas = ordenesSeleccionadas.size;

  const hectareasPorOrden = useMemo(() => {
    return ordenesPendientes.reduce<Record<number | string, number>>(
      (hectareas, grupo) => {
        grupo.data.forEach((orden) => {
          const superficie = parseHectareas(orden.hectareas) ?? 0;
          hectareas[orden.orden_id] = (hectareas[orden.orden_id] ?? 0) + superficie;
        });
        return hectareas;
      },
      {},
    );
  }, [ordenesPendientes]);

  const isFacturando = facturarMutation.isPending;
  const isPagando = marcarFacturaPagadaMutation.isPending;

  const tienePreciosInvalidos = useMemo(() => {
    return Array.from(ordenesSeleccionadas).some((ordenId) => {
      const precio = preciosPorOrden[ordenId] ?? "";
      return !importeEsValido(precio);
    });
  }, [ordenesSeleccionadas, preciosPorOrden]);

  const handleToggleOrden = (ordenId, nombreEstancia) => {
    setOrdenesSeleccionadas((prev) => {
      const next = new Set<number | string>(prev);
      if (next.has(ordenId)) {
        next.delete(ordenId);
        setPreciosPorOrden((prevPrecios) => {
          const { [ordenId]: _removed, ...rest } = prevPrecios;
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

  const handlePrecioChange = (ordenId, value) => {
    setPreciosPorOrden((prev) => ({
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
      preciosPorOrden,
      hectareasPorOrden,
      nroOrdenClientePorOrden,
      nroFactura,
    });

    if (ordenesIds.length === 0) return;

    const response = await facturarMutation.mutateAsync(payload);
    if (!response?.ok) return;

    setOrdenesSeleccionadas(new Set());
    setPreciosPorOrden({});
    setNroOrdenClientePorOrden({});
    setNroFactura("");
    setEstanciaSeleccionada(null);
  };

  const handleMarcarPagado = async (facturaId, fechaPagoSeleccionada) => {
    if (isPagando) return false;

    try {

      await marcarFacturaPagadaMutation.mutateAsync(
        mapPagoFacturaPayload({
          facturaId,
          fechaPago: fechaPagoSeleccionada,
        }),
      );
      return true

    } catch(error) {
      console.log(error)
      return false
    }
  };

  const handleAbrirDialogoPago = (facturaId) => {
    setFacturaPagoSeleccionada(facturaId);
    setFechaPago(undefined);
    setDialogoPagoAbierto(true);
  };

  const handleCerrarDialogoPago = () => {
    setDialogoPagoAbierto(false);
    setFacturaPagoSeleccionada(null);
    setFechaPago(undefined);
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

  const pagoEnProceso = isPagando;

  return (
    <div className="p-4 space-y-4">
      {modoPago ? (
        <PagoPendiente
          loading={loading}
          ordenesPorEstancia={facturasPago}
          isPagando={isPagando}
          onAbrirDialogoPago={handleAbrirDialogoPago}
          onCambiarModo={setModoPago}
          parseImporte={parseImporte}
          formatImporte={formatImporte}
          dialogoPagoAbierto={dialogoPagoAbierto}
          fechaPago={fechaPago}
          pagoEnProceso={pagoEnProceso}
          onFechaPagoChange={setFechaPago}
          onCerrarDialogoPago={handleCerrarDialogoPago}
          onConfirmarPago={handleConfirmarPago}
        />
      ) : (
        <FacturaPendiente
          loading={loading}
          ordenesPorEstancia={ordenesPendientes}
          cantidadSeleccionadas={cantidadSeleccionadas}
          nroFactura={nroFactura}
          isFacturando={isFacturando}
          tienePreciosInvalidos={tienePreciosInvalidos}
          ordenesSeleccionadas={ordenesSeleccionadas}
          preciosPorOrden={preciosPorOrden}
          nroOrdenClientePorOrden={nroOrdenClientePorOrden}
          onCambiarModo={setModoPago}
          onNroFacturaChange={setNroFactura}
          onFacturar={handleFacturar}
          onToggleOrden={handleToggleOrden}
          onPrecioChange={handlePrecioChange}
          onNroOrdenClienteChange={handleNroOrdenClienteChange}
          precioEsValido={importeEsValido}
          dialogoEstanciaAbierto={dialogoEstanciaAbierto}
          onDialogoEstanciaOpenChange={setDialogoEstanciaAbierto}
        />
      )}
    </div>
  );
}
