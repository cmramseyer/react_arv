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
import { Spinner } from '@/components/ui/spinner'

type EstanciaListProps = {
  estancias: Estancia[],
  onDelete: (id: EntityId) => void,
  onEdit: (id: EntityId) => void,
  isDeleting: boolean,
  deletingId: EntityId | null;
}

export default function EstanciaList({ estancias, onDelete, onEdit, isDeleting, deletingId }: EstanciaListProps) {

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
                { e.id == deletingId && isDeleting && <Spinner />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

