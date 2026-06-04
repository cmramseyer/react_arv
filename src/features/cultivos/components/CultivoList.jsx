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

export default function CultivoList() {
  const navigate = useNavigate()

  const cultivosQuery = useCultivosQuery()
  
  const { deleteMutation } = useCultivoMutation()

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch {
      console.log('error delete')
    }
  }

  if (cultivosQuery.isLoading) { return <div>Cargando...</div>}

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {cultivosQuery.data.map((c) => (
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
