import React from 'react'
import { toast } from 'sonner'

import { AsyncButton } from '@/components/ui/async-button'
import { useDeleteMaquinistaMutation } from '@/features/maquinistas/hooks/useMaquinistaQuery'
import { toastText } from '@/lib/toast'
import type { EntityId } from '@/utils/types'

type DeleteMaquinistaButtonProps = {
  maquinistaId: EntityId
}

export default function DeleteMaquinistaButton({ maquinistaId }: DeleteMaquinistaButtonProps) {
  const deleteMutation = useDeleteMaquinistaMutation()

  const handleDelete = async () => {
    const promise = deleteMutation.mutateAsync(maquinistaId)
    toast.promise(promise, toastText('maquinista', 'delete'))
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
