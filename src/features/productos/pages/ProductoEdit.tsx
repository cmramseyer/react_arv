import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import ProductoForm from '@/features/productos/components/ProductoForm'
import { useProductoQuery, useUpdateProductoMutation } from '@/features/productos/hooks/useProductoQuery'
import { toastText } from '@/lib/toast'
import type { ProductoFormValues } from '@/features/productos/schemas/productoSchema'

export default function ProductoEdit() {
  const { id } = useParams()

  if (!id) { return <div>Error</div>}

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Producto</h2>

      <ProductoEditForm productoId={id} />
    </div>
  )
}

type ProductoEditFormProps = {
  productoId: string
}

function ProductoEditForm({ productoId }: ProductoEditFormProps) {
  const navigate = useNavigate()
  const productoQuery = useProductoQuery(productoId)
  const updateMutation = useUpdateProductoMutation()

  const defaultValues = useMemo(
    () => (productoQuery.data ? {
      nombre: productoQuery.data.nombre,
      tipo_producto: productoQuery.data.tipo_producto,
      unidad_medida: productoQuery.data.unidad_medida,
    } : undefined),
    [productoQuery.data],
  )

  const handleSubmit = async (values: ProductoFormValues) => {
    const promise = updateMutation.mutateAsync({ id: productoId, payload: values })
    toast.promise(promise, toastText('producto', 'update'))
    try {
      await promise
      navigate('/productos')
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  if (productoQuery.isLoading) { return <div>Cargando...</div> }
  if (productoQuery.isError) { return <div>No se encontró el producto</div> }

  return (
    <ProductoForm
      defaultValues={defaultValues}
      isSubmitting={updateMutation.isPending}
      onSubmit={handleSubmit}
      submitLabel="Actualizar"
    />
  )
}
