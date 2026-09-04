import React from 'react'
import { toast } from 'sonner'

import { AsyncButton } from '@/components/ui/async-button'
import { useDeleteCultivoMutation } from '@/features/cultivos/hooks/useCultivoQuery'
import { toastText } from '@/lib/toast'
import type { EntityId } from '@/utils/types'

type DeleteCultivoButtonProps = {
  cultivoId: EntityId
}

export default function DeleteCultivoButton({ cultivoId }: DeleteCultivoButtonProps) {
  const deleteMutation = useDeleteCultivoMutation()

  const handleDelete = async () => {
    const promise = deleteMutation.mutateAsync(cultivoId)
    toast.promise(promise, toastText('cultivo', 'delete'))
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
