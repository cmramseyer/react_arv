import React from 'react'

import { Button } from '@/components/ui/button'
import DeleteEstanciaButton from '@/features/estancias/components/DeleteEstanciaButton'
import { displayEstanciaPhone } from '@/features/estancias/utils/phone'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import type { Estancia } from '@/features/estancias/types'
import type { EntityId } from '@/utils/types'

type EstanciaRowProps = {
  estancia: Estancia
  onEdit: (id: EntityId) => void
}

export default function EstanciaRow({ estancia, onEdit }: EstanciaRowProps) {
  return (
    <TableRow>
      <TableCell>{estancia.nombre}</TableCell>
      <TableCell>{estancia.contacto}</TableCell>
      <TableCell>{displayEstanciaPhone(estancia.telefono)}</TableCell>
      <TableCell>{estancia.email}</TableCell>
      <TableCell>
        <Button variant="default" onClick={() => onEdit(estancia.id)}>
          Editar
        </Button>
        <DeleteEstanciaButton estanciaId={estancia.id} />
      </TableCell>
    </TableRow>
  )
}
