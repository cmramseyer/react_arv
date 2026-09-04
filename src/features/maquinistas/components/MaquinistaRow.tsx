import React from 'react'

import { Button } from '@/components/ui/button'
import DeleteMaquinistaButton from '@/features/maquinistas/components/DeleteMaquinistaButton'
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import type { Maquinista } from '@/features/maquinistas/types'
import type { EntityId } from '@/utils/types'

type MaquinistaRowProps = {
  maquinista: Maquinista
  onEdit: (id: EntityId) => void
}

export default function MaquinistaRow({ maquinista, onEdit }: MaquinistaRowProps) {
  return (
    <TableRow>
      <TableCell>{maquinista.nombre}</TableCell>
      <TableCell>
        <Button variant="default" onClick={() => onEdit(maquinista.id)}>
          Editar
        </Button>
        <DeleteMaquinistaButton maquinistaId={maquinista.id} />
      </TableCell>
    </TableRow>
  )
}
