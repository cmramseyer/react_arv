import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  deleteOrdenFumigacion,
  imprimirOrdenFumigacion,
} from "@/features/ordenes-fumigacion/api/ordenesFumigacionService";

import {
  useOrdenFumigacionQuery,
  useOrdenFumigacionAdjuntosQuery,
} from "@/features/ordenes-fumigacion/hooks/useOrdenFumigacionQuery";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import IconLabelBadge from "@/components/IconLabelBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatHectareas } from "@/utils/formatHectareas";
import OrdenFumigacionInfoBadges from "@/features/ordenes-fumigacion/components/OrdenFumigacionInfoBadges";
import DialogEditAdjunto from "@/features/ordenes-fumigacion/components/DialogEditAdjunto";
import OrdenFumigacionAdjuntoParaImprimir from "@/features/ordenes-fumigacion/components/OrdenFumigacionAdjuntoParaImprimir";

const PDF_FILENAME_REGEX = /\.pdf$/i;
const normalizeAdjuntoId = (adjuntoId) => String(adjuntoId);

const getAdjuntoIdValue = (adjunto, index = 0) => {
  if (!adjunto) return `adjunto-${index + 1}`;
  const idValue =
    adjunto.id ?? adjunto.attachment_id ?? adjunto.adjunto_id ?? adjunto.uuid;
  if (idValue !== undefined && idValue !== null && idValue !== "")
    return idValue;
  const urlValue =
    adjunto.url ?? adjunto.file_url ?? adjunto.archivo_url ?? adjunto.path;
  if (urlValue) return urlValue;
  const filenameValue = adjunto.filename ?? adjunto.name ?? adjunto.nombre;
  if (filenameValue) return filenameValue;
  return `adjunto-${index + 1}`;
};

const normalizeAdjunto = (adjunto, index) => {
  const idValue = getAdjuntoIdValue(adjunto, index);
  return {
    ...adjunto,
    id: idValue,
    filename:
      adjunto?.filename ??
      adjunto?.name ??
      adjunto?.nombre ??
      `Adjunto ${index + 1}`,
    url:
      adjunto?.url ??
      adjunto?.file_url ??
      adjunto?.archivo_url ??
      adjunto?.path ??
      "",
  };
};

const normalizeAdjuntosList = (adjuntos) =>
  Array.isArray(adjuntos) ? adjuntos.map(normalizeAdjunto) : [];

const isPdfAdjunto = (adjunto) => {
  const filename = String(adjunto?.filename || "");
  const url = String(adjunto?.url || "");
  return PDF_FILENAME_REGEX.test(filename) || PDF_FILENAME_REGEX.test(url);
};

const isImageAdjunto = (adjunto) => !isPdfAdjunto(adjunto);

export default function OrdenFumigacionShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAdjuntos, setSelectedAdjuntos] = useState(new Set());
  const [adjuntoEnEdicion, setAdjuntoEnEdicion] = useState(null);
  const [adjuntoEditando, setAdjuntoEditando] = useState(null);

  const ordenFumigacionQuery = useOrdenFumigacionQuery(id);
  const ordenFumigacionAdjuntosQuery = useOrdenFumigacionAdjuntosQuery(
    id,
    false,
  );

  const orden = ordenFumigacionQuery.data || null;
  const adjuntos = normalizeAdjuntosList(
    ordenFumigacionAdjuntosQuery.data ?? orden?.adjuntos ?? [],
  );

  useEffect(() => {
    setPdfUrl(orden?.orden_url ?? null);
  }, [orden?.orden_pdf_fecha_creacion, orden?.orden_url]);

  const handleEditar = () => {
    navigate(`/ordenes_fumigacion/${id}/editar`);
  };

  const handleTerminar = () => {
    navigate(`/ordenes_fumigacion/${id}/terminar`);
  };

  const handleBorrar = async () => {
    if (confirm("¿Seguro quieres borrar esta orden?")) {
      await deleteOrdenFumigacion(id);
      navigate("/ordenes_fumigacion");
    }
  };

  const handleGenerarPdf = async () => {
    setIsDialogOpen(true);
    setSelectedAdjuntos(new Set());
    await ordenFumigacionAdjuntosQuery.refetch();
  };

  const handleToggleAdjunto = (adjuntoId) => {
    const normalizedId = normalizeAdjuntoId(adjuntoId);
    setSelectedAdjuntos((prev) => {
      const next = new Set(prev);
      if (next.has(normalizedId)) {
        next.delete(normalizedId);
      } else {
        next.add(normalizedId);
      }
      return next;
    });
  };

  const handleEditarAdjunto = (adjunto) => {
    if (!isImageAdjunto(adjunto)) {
      return;
    }

    setAdjuntoEditando(adjunto);
  };

  const handleImprimir = async (attachmentIds) => {
    const data = await imprimirOrdenFumigacion(id, attachmentIds);
    setPdfUrl(data.orden_url);
    setIsDialogOpen(false);
  };

  const handleAdjuntoSaved = async (updatedOrden) => {
    setPdfUrl(updatedOrden?.orden_url ?? null);
    setSelectedAdjuntos(new Set());
    await ordenFumigacionQuery.refetch();
    await ordenFumigacionAdjuntosQuery.refetch();
  };

  const handleVerPdf = async () => {
    window.open(pdfUrl, "_blank");
  };

  const labelGenerarPdf = pdfUrl ? "Regenerar PDF" : "Generar PDF";
  const selectedAdjuntosArray = Array.from(selectedAdjuntos);
  const isSavingAdjunto = adjuntoEnEdicion !== null;
  const labelImprimirSeleccion =
    selectedAdjuntosArray.length > 0
      ? "Imprimir con planos"
      : "Imprimir sin planos";

  const lotesOrden =
    Array.isArray(orden?.lotes) && orden.lotes.length > 0 ? orden.lotes : [];
  const facturasOrden = Array.isArray(orden?.facturas) ? orden.facturas : [];

  const formatCantidad = (value) => {
    if (value === null || value === undefined || value === "")
      return "Sin datos";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return "Sin datos";
    return numericValue.toLocaleString("es-AR", { maximumFractionDigits: 2 });
  };

  const getEstadoVariant = (estado) => {
    const estadoNormalizado = (estado || "").toLowerCase();
    if (estadoNormalizado === "activa") return "destructive";
    if (estadoNormalizado === "terminada") return "success";
    return "secondary";
  };

  const botonVerPdf = !!pdfUrl && (
    <Button onClick={handleVerPdf} variant="default">
      Ver Pdf
    </Button>
  );

  if (!orden) {
    return <div className="p-4">Cargando...</div>;
  }

  const estadoOrden = (orden.estado_orden || "").toLowerCase();
  const estadoLabel = estadoOrden
    ? `${estadoOrden.charAt(0).toUpperCase()}${estadoOrden.slice(1)}`
    : "Sin estado";
  const isTerminada = estadoOrden === "terminada";
  const totalHectareas =
    lotesOrden.length > 0
      ? lotesOrden.reduce((acc, lote) => acc + Number(lote.hectareas ?? 0), 0)
      : (orden.hectareas ?? orden.hectareas_reales);
  const hectareasLabel = formatHectareas(totalHectareas);
  const createdAtLabel = orden.created_at_locale || "Sin fecha";

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 md:hidden">
          <CardTitle className="text-lg">Orden #{orden.id}</CardTitle>
          <Badge variant={getEstadoVariant(estadoOrden)}>{estadoLabel}</Badge>
        </div>
        <div className="text-sm text-muted-foreground md:hidden">
          Creado: {createdAtLabel} por: {orden.creator || "Sin datos"}
        </div>

        <div className="hidden items-center justify-between gap-4 md:flex">
          <div className="flex flex-wrap items-center gap-4">
            <CardTitle className="text-lg">Orden #{orden.id}</CardTitle>
            <span className="text-lg font-semibold">
              {orden.nombre_estancia || "Sin estancia"}
            </span>
            {orden.cultivo && (
              <IconLabelBadge
                iconName="Sprout"
                value={orden.cultivo.nombre}
                tooltip="Cultivo"
                variant="outline"
                className="border-transparent bg-green-800 text-white"
              />
            )}
            <span className="text-sm text-muted-foreground">
              Creado: {createdAtLabel} por: {orden.creator || "Sin datos"}
            </span>
          </div>
          <Badge variant={getEstadoVariant(estadoOrden)}>{estadoLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="md:hidden">
          <div className="text-sm font-medium">Estancia</div>
          <div className="text-sm text-muted-foreground">
            {orden.nombre_estancia || "Sin estancia"}
          </div>
          {orden.cultivo && (
            <IconLabelBadge
              iconName="Sprout"
              value={orden.cultivo.nombre}
              tooltip="Cultivo"
              variant="outline"
              className="border-transparent bg-green-800 text-white"
            />
          )}
        </div>

        {lotesOrden.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {lotesOrden.map((lote, loteIndex) => {
              const loteHectareas = formatHectareas(lote.hectareas);
              const loteKey =
                lote.id ?? lote.lote_id ?? `${orden.id}-${loteIndex}`;
              const dosisList = Array.isArray(lote.dosis) ? lote.dosis : [];
              const dosisValue = `dosis-${orden.id}-${loteKey}`;

              return (
                <li key={loteKey} className="space-y-2">
                  <div>
                    Lote {lote.nombre || "Sin nombre"}: {loteHectareas}
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value={dosisValue}
                      className="rounded-md border border-border"
                    >
                      <AccordionTrigger className="group rounded-md bg-muted/40 px-3 py-2 text-sm hover:bg-muted/60">
                        <span className="group-data-[state=open]:hidden">
                          Ver dosis
                        </span>
                        <span className="hidden group-data-[state=open]:inline">
                          Ocultar dosis
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        {dosisList.length > 0 ? (
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {dosisList.map((dosis, dosisIndex) => {
                              const cantidadLabel = formatCantidad(
                                dosis.cantidad,
                              );
                              const unidadLabel = dosis.unidad_medida
                                ? ` (${dosis.unidad_medida})`
                                : "";

                              return (
                                <li
                                  key={
                                    dosis.id ?? `${loteKey}-dosis-${dosisIndex}`
                                  }
                                >
                                  {dosis.producto || "Producto"}:{" "}
                                  {cantidadLabel}
                                  {unidadLabel}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Sin dosis cargadas.
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>
              Lote {orden.nombre_lote || orden.temp_lotes || "Sin lote"}:{" "}
              {formatHectareas(orden.hectareas || orden.hectareas_reales)}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>Total Hectareas: {hectareasLabel}</span>
          <span>Sensible: {orden.sensible ? "Si" : "No"}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Comentarios:{" "}
          {orden.comentarios ? orden.comentarios : "Sin comentarios"}
        </div>

        <OrdenFumigacionInfoBadges orden={orden} />
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={handleEditar} variant="default">
          Editar
        </Button>
        {!isTerminada ? (
          <Button onClick={handleTerminar} variant="default">
            Terminar
          </Button>
        ) : null}
        <Button onClick={handleBorrar} variant="default">
          Borrar
        </Button>
        <Button onClick={handleGenerarPdf} variant="default">
          {labelGenerarPdf}
        </Button>
        {botonVerPdf}
        <Button
          variant="secondary"
          onClick={() => navigate("/ordenes_fumigacion")}
        >
          Volver
        </Button>
      </CardFooter>

      <OrdenFumigacionAdjuntoParaImprimir
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isLoadingAdjuntos={ordenFumigacionAdjuntosQuery.isFetching}
        hasAdjuntos={adjuntos.length > 0}
        adjuntos={adjuntos}
        selectedAdjuntos={selectedAdjuntos}
        onToggleAdjunto={handleToggleAdjunto}
        isImageAdjunto={isImageAdjunto}
        onEditarAdjunto={handleEditarAdjunto}
        isSavingAdjunto={isSavingAdjunto}
        adjuntoEditando={adjuntoEditando}
        adjuntoEnEdicion={adjuntoEnEdicion}
        normalizeAdjuntoId={normalizeAdjuntoId}
        onImprimir={() => handleImprimir(selectedAdjuntosArray)}
        labelImprimirSeleccion={labelImprimirSeleccion}
      />
      <DialogEditAdjunto
        ordenId={id}
        adjunto={adjuntoEditando}
        onClose={() => setAdjuntoEditando(null)}
        onSaved={handleAdjuntoSaved}
        onSavingChange={setAdjuntoEnEdicion}
      />
    </Card>
  );
}
