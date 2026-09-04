import React from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import ProductoRow from '@/features/productos/components/ProductoRow'
import type { Producto } from '@/features/productos/types'
import type { EntityId } from '@/utils/types'

type ProductoListProps = {
  productos: Producto[]
  onEdit: (id: EntityId) => void
}

export default function ProductoList({ productos, onEdit }: ProductoListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Unidad</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {productos.map((producto) => (
          <ProductoRow key={producto.id} producto={producto} onEdit={onEdit} />
        ))}
      </TableBody>
    </Table>
  )
}
