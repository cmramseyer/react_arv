import React from 'react'

import { Button } from '@/components/ui/button'
import DeleteCultivoButton from '@/features/cultivos/components/DeleteCultivoButton'
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import type { Cultivo } from '@/features/cultivos/types'
import type { EntityId } from '@/utils/types'

type CultivoRowProps = {
  cultivo: Cultivo
  onEdit: (id: EntityId) => void
}

export default function CultivoRow({ cultivo, onEdit }: CultivoRowProps) {
  return (
    <TableRow>
      <TableCell>{cultivo.nombre}</TableCell>
      <TableCell>
        <Button variant="default" onClick={() => onEdit(cultivo.id)}>
          Editar
        </Button>
        <DeleteCultivoButton cultivoId={cultivo.id} />
      </TableCell>
    </TableRow>
  )
}
