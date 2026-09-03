import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCultivosQuery, useCultivoMutation } from '@/features/cultivos/hooks/useCultivoQuery'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from '@/components/ui/button'
import type { EntityId } from '@/utils/types'
import CultivoListSkeleton from '@/features/cultivos/components/CultivoListSkeleton'

export default function CultivoList() {
  const navigate = useNavigate()

  const cultivosQuery = useCultivosQuery()
  
  const { deleteMutation } = useCultivoMutation()

  const handleDelete = async (id: EntityId) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch {
      console.log('error delete')
    }
  }

  if (cultivosQuery.isLoading) { return <CultivoListSkeleton /> }

  if (cultivosQuery.isError) {
    return (
      <div className="space-y-2">
        <div>Error: {cultivosQuery.error?.message}</div>
        <Button onClick={() => cultivosQuery.refetch()} variant="default">
          Reintentar
        </Button>
      </div>
    )
  }

  const cultivos = cultivosQuery.data ?? []

  if (cultivos.length === 0) { return <div>No hay cultivos</div> }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {cultivos.map((c) => (
          <TableRow key={c.id}>
            <TableCell>{c.nombre}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => navigate(`/cultivos/${c.id}/edit`)}>
                Editar
              </Button>
              <Button variant="default" onClick={() => handleDelete(c.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
