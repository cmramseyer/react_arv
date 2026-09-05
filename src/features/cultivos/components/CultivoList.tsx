import React from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { EntityId } from '@/utils/types'

import CultivoRow from '@/features/cultivos/components/CultivoRow'
import type { Cultivo } from '@/features/cultivos/types'

type CultivoListProps = {
  cultivos: Cultivo[]
  onEdit: (id: EntityId) => void
}

export default function CultivoList({ cultivos, onEdit }: CultivoListProps) {
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
          <CultivoRow key={c.id} cultivo={c} onEdit={onEdit} />
        ))}
      </TableBody>
    </Table>
  )
}
