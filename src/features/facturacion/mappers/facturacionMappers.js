import { format } from "date-fns";

export const mapFacturacionPayload = ({
  ordenesSeleccionadas,
  importesPorOrden,
  nroOrdenClientePorOrden,
  nroFactura,
}) => {
  const ordenesIds = Array.from(ordenesSeleccionadas);

  return {
    ordenesIds,
    payload: {
      ordenes_fumigacion: ordenesIds.map((ordenId) => {
        const importeTexto = importesPorOrden[ordenId] ?? "0,00";
        const importe = Number(importeTexto.replace(",", "."));
        const nroOrdenCliente = (
          nroOrdenClientePorOrden[ordenId] ?? ""
        ).trim();
        const payload = { id: ordenId, importe };

        if (nroOrdenCliente) {
          payload.nro_orden_cliente = nroOrdenCliente;
        }

        return payload;
      }),
      nro_factura: nroFactura.trim() || undefined,
    },
  };
};

export const mapPagoFacturaPayload = ({ facturaId, fechaPago }) => ({
  facturaId,
  fechaPago: format(fechaPago, "yyyy-MM-dd"),
});
