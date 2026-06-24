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
  parseImporte,
} from "@/utils/formatHectareas";

export default function Facturacion() {
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState(
    () => new Set(),
  );
  const [importesPorOrden, setImportesPorOrden] = useState({});
  const [nroOrdenClientePorOrden, setNroOrdenClientePorOrden] = useState({});
  const [nroFactura, setNroFactura] = useState("");
  const [modoPago, setModoPago] = useState(false);
  const [dialogoEstanciaAbierto, setDialogoEstanciaAbierto] = useState(false);
  const [estanciaSeleccionada, setEstanciaSeleccionada] = useState(null);
  const [dialogoPagoAbierto, setDialogoPagoAbierto] = useState(false);
  const [facturaPagoSeleccionada, setFacturaPagoSeleccionada] = useState(null);
  const [fechaPago, setFechaPago] = useState();

  const ordenesPendientesQuery = useOrdenesPendientesFacturacionQuery(!modoPago);
  const facturasPagoQuery = useFacturasPagoQuery(modoPago);
  const { facturarMutation, marcarFacturaPagadaMutation } =
    useFacturacionMutation();

  const activeQuery = modoPago ? facturasPagoQuery : ordenesPendientesQuery;
  const ordenesPorEstancia = activeQuery.data ?? [];
  const loading = activeQuery.isFetching;

  const cantidadSeleccionadas = ordenesSeleccionadas.size;

  const isFacturando = facturarMutation.isPending;
  const isPagando = marcarFacturaPagadaMutation.isPending;

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
    if (isPagando) return false;

    const response = await marcarFacturaPagadaMutation.mutateAsync(
      mapPagoFacturaPayload({
        facturaId,
        fechaPago: fechaPagoSeleccionada,
      }),
    );
    if (!response?.ok) return false;

    return true;
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

  const pagoEnProceso = isPagando;

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
          dialogoEstanciaAbierto={dialogoEstanciaAbierto}
          onDialogoEstanciaOpenChange={setDialogoEstanciaAbierto}
        />
      )}
    </div>
  );
}
