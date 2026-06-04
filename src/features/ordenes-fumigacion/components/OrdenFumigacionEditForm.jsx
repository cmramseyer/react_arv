import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useMaquinistasQuery } from "@/features/maquinistas/hooks/useMaquinistaQuery";



export default function OrdenFumigacionEditForm({control, estadoOrden}) {
  const maquinistasQuery = useMaquinistasQuery()
  
  const maquinistas = maquinistasQuery.data ?? []

  return (
    <>
      <FormField
        control={control}
        name="datos_clima"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Datos Clima</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={estadoOrden !== "terminada"}
                className={estadoOrden !== "terminada" ? "bg-gray-100" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="info_trabajo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Info Trabajo</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={estadoOrden !== "terminada"}
                className={estadoOrden !== "terminada" ? "bg-gray-100" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="fecha_trabajo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha Trabajo</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="date"
                value={field.value ?? ""}
                disabled={estadoOrden !== "terminada"}
                className={estadoOrden !== "terminada" ? "bg-gray-100" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="maquinista_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maquinista</FormLabel>
            <FormControl>
              {estadoOrden === "terminada" ? (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    { maquinistas.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={
                    maquinistas.find((m) => m.id == field.value)?.nombre ||
                    "No asignado"
                  }
                  disabled
                  className="bg-gray-100"
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="creator"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Creado Por</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ''} disabled className="bg-gray-100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
