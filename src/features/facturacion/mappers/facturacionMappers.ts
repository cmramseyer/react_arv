import { format } from "date-fns";
import type { FacturarOrdenesPayload } from "@/features/ordenes-fumigacion/types";


type FacturacionPayload = {
  ordenesSeleccionadas: Set<number | string>,
  importesPorOrden: Record<number | string, string>,
  nroOrdenClientePorOrden: Record<number | string, string>,
  nroFactura: string
}

type FacturacionOrdenPayload = {
  id: number | string,
  importe: number,
  nro_orden_cliente?: string
}

type MapFacturacionPayloadResponse = {
  ordenesIds: Array<number | string>,
  payload: FacturarOrdenesPayload
}

export const mapFacturacionPayload = ({
  ordenesSeleccionadas,
  importesPorOrden,
  nroOrdenClientePorOrden,
  nroFactura,
}: FacturacionPayload ): MapFacturacionPayloadResponse => {
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
        const payload: FacturacionOrdenPayload = { id: ordenId, importe };

        if (nroOrdenCliente) {
          payload.nro_orden_cliente = nroOrdenCliente;
        }

        return payload;
      }),
      nro_factura: nroFactura.trim() || undefined,
    },
  };
};

type PagoFacturaPayload = {
  facturaId: number | string,
  fechaPago: string
}

export const mapPagoFacturaPayload = ({ facturaId, fechaPago }: { facturaId: number | string, fechaPago: Date }): PagoFacturaPayload => ({
  facturaId,
  fechaPago: format(fechaPago, "yyyy-MM-dd"),
});
