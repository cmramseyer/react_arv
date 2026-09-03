import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Estancia } from '@/features/estancias/types'
import type { EntityId } from '@/utils/types'

import { Button } from '@/components/ui/button'

type EstanciaListProps = {
  estancias: Estancia[],
  onDelete: (id: EntityId) => void,
  onEdit: (id: EntityId) => void,
  deleteErrorMessage: string
}

export default function EstanciaList({ estancias, onDelete, onEdit, deleteErrorMessage }: EstanciaListProps) {

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {estancias.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{e.nombre}</TableCell>
            <TableCell>{e.contacto}</TableCell>
            <TableCell>{e.telefono}</TableCell>
            <TableCell>{e.email}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => onEdit(e.id)}>
                Editar
              </Button>
              <Button variant="default" onClick={() => onDelete(e.id)}>
                Eliminar
              </Button>
              { deleteErrorMessage && deleteErrorMessage }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

