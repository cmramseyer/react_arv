import React from 'react'
import { toast } from 'sonner'

import ProductoForm from '@/features/productos/components/ProductoForm'
import { useCreateProductoMutation } from '@/features/productos/hooks/useProductoQuery'
import { toastText } from '@/lib/toast'
import type { ProductoFormValues } from '@/features/productos/schemas/productoSchema'

type ProductoCreateFormProps = {
  onSuccess: () => void
}

export default function ProductoCreateForm({ onSuccess }: ProductoCreateFormProps) {
  const createMutation = useCreateProductoMutation()

  const handleSubmit = async (values: ProductoFormValues) => {
    const promise = createMutation.mutateAsync(values)
    toast.promise(promise, toastText('producto', 'create'))
    try {
      await promise
      onSuccess()
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  return (
    <ProductoForm
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit}
      submitLabel="Guardar"
    />
  )
}
