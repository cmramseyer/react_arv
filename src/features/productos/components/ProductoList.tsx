import React from 'react'
import { useProductosQuery, useProductosMutation } from '@/features/productos/hooks/useProductoQuery'

import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { EntityId } from '@/utils/types'
import ProductoListSkeleton from '@/features/productos/components/ProductoListSkeleton'

export default function ProductoList() {

  const navigate = useNavigate()

  const { data, isLoading, isError, error, refetch } = useProductosQuery()
  const { deleteMutation } = useProductosMutation()

  const handleDelete = async (id: EntityId) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch {

    }

  }

  if (isLoading) { return <ProductoListSkeleton /> }
  if (isError) {
    return (
      <div className="space-y-2">
        <div>Error: {error.message}</div>
        <Button onClick={() => refetch()} variant="default">
          Reintentar
        </Button>
      </div>
    )
  }
  if (!data || data.length === 0) { return <div>No hay productos</div> }

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
        {data.map((producto) => (
          <TableRow key={producto.id}>
            <TableCell>{producto.nombre}</TableCell>
            <TableCell>{producto.tipo_producto}</TableCell>
            <TableCell>{producto.unidad_medida}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => navigate(`/productos/${producto.id}/edit`)}>
                Editar
              </Button>
              <Button variant="default" onClick={() => handleDelete(producto.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
