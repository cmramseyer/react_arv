import React from 'react'
import { toast } from 'sonner'

import { AsyncButton } from '@/components/ui/async-button'
import { useDeleteProductoMutation } from '@/features/productos/hooks/useProductoQuery'
import { toastText } from '@/lib/toast'
import type { EntityId } from '@/utils/types'

type DeleteProductoButtonProps = {
  productoId: EntityId
}

export default function DeleteProductoButton({ productoId }: DeleteProductoButtonProps) {
  const deleteMutation = useDeleteProductoMutation()

  const handleDelete = async () => {
    const promise = deleteMutation.mutateAsync(productoId)
    toast.promise(promise, toastText('producto', 'delete'))
    try {
      await promise
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  return (
    <AsyncButton
      variant="default"
      isLoading={deleteMutation.isPending}
      onClick={handleDelete}
    >
      Eliminar
    </AsyncButton>
  )
}
