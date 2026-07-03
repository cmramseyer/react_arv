import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrdenesFumigacionQuery } from "../hooks/useOrdenFumigacionQuery";
import { Button } from "@/components/ui/button";
import OrdenFumigacionCard from "@/features/ordenes-fumigacion/components/OrdenFumigacionCard";
import OrdenFumigacionTerminar from "./OrdenFumigacionTerminar";
import type { EntityId } from '@/utils/types'

export default function OrdenesFumigacion() {
  const navigate = useNavigate();
  const [estadoOrdenSeleccionada, setEstadoOrdenSeleccionada] =
    useState("activa");
  const [selectedOrdenId, setSelectedOrdenId] = useState<EntityId | null>(null);
  const [isTerminarDialogOpen, setIsTerminarDialogOpen] = useState(false);

  const ordenesFumigacionQuery = useOrdenesFumigacionQuery({
    estado: estadoOrdenSeleccionada,
  });

  useEffect(() => {
    ordenesFumigacionQuery.refetch();
  }, [estadoOrdenSeleccionada]);

  const handleEstadoOrdenes = async (estado) => {
    setEstadoOrdenSeleccionada(estado);
  };

  const handleVerOrden = (id) => {
    navigate(`/ordenes_fumigacion/${id}`);
  };

  const handleTerminar = (id) => {
    setSelectedOrdenId(id);
    setIsTerminarDialogOpen(true);
  };

  const seleccionadoClass = (boton) => {
    if (boton === estadoOrdenSeleccionada) {
      return "default";
    }
    return "secondary";
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold">Órdenes de Fumigación</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-1 md:justify-center">
          <Button
            onClick={() => handleEstadoOrdenes("")}
            variant={seleccionadoClass("")}
          >
            Todas
          </Button>
          <Button
            onClick={() => handleEstadoOrdenes("activa")}
            variant={seleccionadoClass("activa")}
          >
            Activas
          </Button>
          <Button
            onClick={() => handleEstadoOrdenes("terminada")}
            variant={seleccionadoClass("terminada")}
          >
            Terminadas
          </Button>
        </div>

        <div className="flex md:flex-1 md:justify-end">
          <Button onClick={() => navigate("/ordenes_fumigacion/new")}>
            Crear Orden
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {ordenesFumigacionQuery.data &&
          ordenesFumigacionQuery.data.map((orden) => (
            <OrdenFumigacionCard
              key={orden.id}
              orden={orden}
              onVerOrden={handleVerOrden}
              onTerminar={handleTerminar}
            />
          ))}
      </div>
      <OrdenFumigacionTerminar
        selectedOrdenId={selectedOrdenId}
        isTerminarDialogOpen={isTerminarDialogOpen}
        setIsTerminarDialogOpen={setIsTerminarDialogOpen}
      />
    </div>
  );
}
