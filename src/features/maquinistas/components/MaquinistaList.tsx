import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaquinistasQuery, useMaquinistaMutation } from '@/features/maquinistas/hooks/useMaquinistaQuery'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { EntityId } from '@/utils/types'

import { Button } from '@/components/ui/button'
import MaquinistaListSkeleton from '@/features/maquinistas/components/MaquinistaListSkeleton'

export default function MaquinistaList() {
  const navigate = useNavigate()

  const maquinistasQuery = useMaquinistasQuery()
  const { deleteMutation } = useMaquinistaMutation()

  const handleDelete = async (id: EntityId) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch {
      console.log('error delete')
    }
  }

  if (maquinistasQuery.isLoading) { return <MaquinistaListSkeleton /> }

  if (maquinistasQuery.isError) {
    return (
      <div className="space-y-2">
        <div>Error: {maquinistasQuery.error?.message}</div>
        <Button onClick={() => maquinistasQuery.refetch()} variant="default">
          Reintentar
        </Button>
      </div>
    )
  }

  const maquinistas = maquinistasQuery.data ?? []

  if (maquinistas.length === 0) { return <div>No hay maquinistas</div> }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {maquinistas.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.nombre}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => navigate(`/maquinistas/${m.id}/edit`)}>
                Editar
              </Button>
              <Button variant="default" onClick={() => handleDelete(m.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
