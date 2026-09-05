import React from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Estancia } from '@/features/estancias/types'
import type { EntityId } from '@/utils/types'
import EstanciaRow from '@/features/estancias/components/EstanciaRow'

type EstanciaListProps = {
  estancias: Estancia[],
  onEdit: (id: EntityId) => void,
}

export default function EstanciaList({ estancias, onEdit }: EstanciaListProps) {

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
        {estancias.map((estancia) => (
          <EstanciaRow key={estancia.id} estancia={estancia} onEdit={onEdit} />
        ))}
      </TableBody>
    </Table>
  )
}
