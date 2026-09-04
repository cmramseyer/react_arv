import React from 'react'

import { Button } from '@/components/ui/button'
import DeleteProductoButton from '@/features/productos/components/DeleteProductoButton'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import type { Producto } from '@/features/productos/types'
import type { EntityId } from '@/utils/types'

type ProductoRowProps = {
  producto: Producto
  onEdit: (id: EntityId) => void
}

export default function ProductoRow({ producto, onEdit }: ProductoRowProps) {
  return (
    <TableRow>
      <TableCell>{producto.nombre}</TableCell>
      <TableCell>{producto.tipo_producto}</TableCell>
      <TableCell>{producto.unidad_medida}</TableCell>
      <TableCell>
        <Button variant="default" onClick={() => onEdit(producto.id)}>
          Editar
        </Button>
        <DeleteProductoButton productoId={producto.id} />
      </TableCell>
    </TableRow>
  )
}
