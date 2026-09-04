import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProductoList from '@/features/productos/components/ProductoList'
import ProductoListSkeleton from '@/features/productos/components/ProductoListSkeleton'
import { Button } from '@/components/ui/button'
import { useProductosQuery } from '@/features/productos/hooks/useProductoQuery'
import type { EntityId } from '@/utils/types'

export default function Productos() {

  const navigate = useNavigate()

  const productosQuery = useProductosQuery()

  const handleEdit = (id: EntityId) => {
    navigate(`/productos/${id}/edit`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Productos</h1>

        <Button onClick={() => navigate('/productos/new')}>Crear Producto</Button>
      </div>

      {productosQuery.isLoading ? <ProductoListSkeleton /> :
        productosQuery.isError ? (
          <div className="space-y-2">
            <div>Error: {productosQuery.error?.message}</div>
            <Button onClick={() => productosQuery.refetch()} variant="default">
              Reintentar
            </Button>
          </div>
        ) :
        (productosQuery.data ?? []).length === 0 ? (
          <div>No hay productos</div>
        ) : (
          <ProductoList
            productos={productosQuery.data ?? []}
            onEdit={handleEdit}
          />
        )
      }
    </div>
  )
}
