import React from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { EntityId } from '@/utils/types'

import MaquinistaRow from '@/features/maquinistas/components/MaquinistaRow'
import type { Maquinista } from '@/features/maquinistas/types'

type MaquinistaListProps = {
  maquinistas: Maquinista[]
  onEdit: (id: EntityId) => void
}

export default function MaquinistaList({ maquinistas, onEdit }: MaquinistaListProps) {
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
          <MaquinistaRow key={m.id} maquinista={m} onEdit={onEdit} />
        ))}
      </TableBody>
    </Table>
  )
}
