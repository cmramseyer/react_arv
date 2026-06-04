import React from "react";
import IconLabelBadge from "@/components/IconLabelBadge";
import { formatDate, joinWith } from "@/utils/formatHectareas";

export default function OrdenFumigacionInfoBadges({ orden }) {
  const isTerminada = orden?.estado_orden === 'terminada'
  return (
    <>
      {isTerminada && orden ? (
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <IconLabelBadge
              iconName="Tractor"
              value={joinWith(
                orden.maquinista?.nombre,
                orden.fecha_trabajo_ddmmyyyy,
                "-",
              )}
              tooltip="Maquinista y fecha de trabajo"
              variant="outline"
            />
          </div>
          <div>Comentario de trabajo: {orden.info_trabajo || "Sin datos"}</div>
          <div>Datos del clima: {orden.datos_clima || "Sin datos"}</div>
        </div>
      ) : null}

      {orden && orden.facturas.length > 0 ? (
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="text-sm font-medium text-foreground">Facturacion</div>
          <ul className="space-y-2">
            {orden.facturas.map((factura, facturaIndex) => (
              <li key={`${orden.id}-factura-${facturaIndex}`}>
                <div className="flex flex-wrap gap-2">
                  <IconLabelBadge
                    iconName="ReceiptText"
                    value={factura.nro_factura || "Sin datos"}
                    tooltip="Nro. de factura"
                    variant="outline"
                    className="border-transparent bg-violet-200 text-slate-900"
                  />
                  <IconLabelBadge
                    iconName="Calendar"
                    value={`Facturado: ${formatDate(factura.fecha_factura)}`}
                    tooltip="Fecha de facturación"
                    variant="outline"
                    className="border-transparent bg-gray-300 text-slate-900"
                  />
                  <IconLabelBadge
                    iconName="CalendarCheck"
                    value={`Cobrado: ${formatDate(factura.fecha_pago)}`}
                    tooltip="Fecha de cobro"
                    variant="outline"
                    className="border-transparent bg-lime-500 text-slate-900"
                  />
                  <IconLabelBadge
                    iconName="File"
                    value={factura.nro_orden_cliente || "Sin datos"}
                    tooltip="Nro. de orden del cliente"
                    variant="outline"
                    className="border-transparent bg-indigo-300 text-slate-900"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
