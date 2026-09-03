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

  if ( maquinistasQuery.isLoading ) { return <div>Cargando...</div> }

  const maquinistas = maquinistasQuery.data ?? []

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
