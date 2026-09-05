import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  useOrdenFumigacionQuery,
  useOrdenFumigacionMutation,
} from "../hooks/useOrdenFumigacionQuery";
import { useMaquinistasQuery } from "../../maquinistas/hooks/useMaquinistaQuery";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/async-button";
import { toastText } from "@/lib/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatHectareas } from "@/utils/formatHectareas";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { EntityId } from '@/utils/types'

type OrdenFumigacionTerminarProps = {
  selectedOrdenId: EntityId | null,
  isTerminarDialogOpen: boolean,
  setIsTerminarDialogOpen: (flag: boolean) => void,
  onOpenChange?: (flag: boolean) => void,
  onSuccess?: () => void
}

export default function OrdenFumigacionTerminar({
  selectedOrdenId,
  isTerminarDialogOpen,
  setIsTerminarDialogOpen,
  onSuccess,
}: OrdenFumigacionTerminarProps) {
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      datos_clima: "",
      info_trabajo: "",
      fecha_trabajo: "",
      maquinista_id: "",
    },
  });


  const ordenFumigacionQuery = useOrdenFumigacionQuery(selectedOrdenId, true);
  const maquinistasQuery = useMaquinistasQuery();
  const { terminarMutation } = useOrdenFumigacionMutation();

  const estanciaNombre = ordenFumigacionQuery.data?.nombre_estancia || "Sin datos";
  const loteNombre = ordenFumigacionQuery.data?.nombre_lote || "Sin datos";
  const loteHectareas = ordenFumigacionQuery.data?.hectareas || 0;

  useEffect(() => {
    if (!ordenFumigacionQuery.data) return;

    reset({
      datos_clima: ordenFumigacionQuery.data.datos_clima || "",
      info_trabajo: ordenFumigacionQuery.data.info_trabajo || "",
      fecha_trabajo: ordenFumigacionQuery.data.fecha_trabajo || "",
      maquinista_id: ordenFumigacionQuery.data.maquinista?.id
        ? String(ordenFumigacionQuery.data.maquinista.id)
        : "",
    });
  }, [ordenFumigacionQuery.data, reset]);

  const handleTerminar = async (data) => {
    if(!selectedOrdenId) return
    const payload = {
      orden_fumigacion: {
        datos_clima: data.datos_clima || "",
        info_trabajo: data.info_trabajo || "",
        fecha_trabajo: data.fecha_trabajo || "",
        maquinista_id: data.maquinista_id || "",
      },
    };

    const promise = terminarMutation.mutateAsync({ id: selectedOrdenId, payload })
    toast.promise(promise, toastText('orden_fumigacion', 'finish'))
    try {
      await promise
    } catch {
      // Sonner reports the failure to the user.
      return
    }
    await onSuccess?.();
    setIsTerminarDialogOpen(false);
  };

  if (isTerminarDialogOpen && ordenFumigacionQuery.isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <Dialog
      open={isTerminarDialogOpen}
      onOpenChange={(open) => setIsTerminarDialogOpen(open)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terminar Orden</DialogTitle>
          <DialogDescription className="sr-only">
            Formulario para terminar una orden de fumigacion.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">
            Terminar Orden de Fumigación
          </h2>

          {/* Datos fijos no editables */}
          <div className="space-y-2 mb-6">
            <div>
              <strong>Estancia:</strong> {estanciaNombre}
            </div>
            <div>
              <strong>Lote:</strong> {loteNombre}
            </div>
            <div>
              <strong>Hectáreas:</strong> {formatHectareas(loteHectareas)}
            </div>
          </div>

          {/* Formulario de campos editables */}
          <form onSubmit={handleSubmit(handleTerminar)} className="space-y-4">
            <div>
              <label>Datos Clima</label>
              <input
                {...register("datos_clima")}
                className="block w-full border p-2"
              />
            </div>
            <div>
              <label>Info Trabajo</label>
              <input
                {...register("info_trabajo")}
                className="block w-full border p-2"
              />
            </div>
            <div>
              <label>Fecha Trabajo</label>
              <input
                {...register("fecha_trabajo")}
                type="date"
                className="block w-full border p-2"
              />
            </div>
            <div>
              <label>Maquinista</label>
              <Controller
                name="maquinista_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full border p-2">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {maquinistasQuery.data &&
                        maquinistasQuery.data.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AsyncButton type="submit" isLoading={terminarMutation.isPending}>
                Confirmar Terminar
              </AsyncButton>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsTerminarDialogOpen(false)}
                >
                  Volver
                </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
