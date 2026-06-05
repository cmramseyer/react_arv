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
import OrdenFumigacionTerminar from "@/features/ordenes-fumigacion/pages/OrdenFumigacionTerminar";
import OrdenFumigacionCard from "@/features/ordenes-fumigacion/components/OrdenFumigacionCard";

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
  const [isTerminarDialogOpen, setIsTerminarDialogOpen] = useState(false);
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
    setIsTerminarDialogOpen(true);
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
    <>
    <OrdenFumigacionCard orden={orden} onTerminar={() => {}} />
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
      <OrdenFumigacionTerminar
        selectedOrdenId={id}
        isTerminarDialogOpen={isTerminarDialogOpen}
        setIsTerminarDialogOpen={setIsTerminarDialogOpen}
      />
    </>
  );
}
