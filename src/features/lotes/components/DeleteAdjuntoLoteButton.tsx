import React from 'react'
import { toast } from 'sonner'

import { AsyncButton } from '@/components/ui/async-button'
import { useDeleteAdjuntoLoteMutation } from '@/features/lotes/hooks/useAdjuntoLoteQuery'
import { toastText } from '@/lib/toast'
import type { EntityId } from '@/utils/types'

type DeleteAdjuntoLoteButtonProps = {
  loteId: EntityId
  adjuntoId: EntityId
}

export default function DeleteAdjuntoLoteButton({ loteId, adjuntoId }: DeleteAdjuntoLoteButtonProps) {
  const deleteMutation = useDeleteAdjuntoLoteMutation()

  const handleDelete = async () => {
    const promise = deleteMutation.mutateAsync({ loteId, payload: adjuntoId })
    toast.promise(promise, toastText('lote', 'remove'))
    try {
      await promise
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  return (
    <AsyncButton
      size="sm"
      variant="destructive"
      isLoading={deleteMutation.isPending}
      onClick={handleDelete}
    >
      Eliminar
    </AsyncButton>
  )
}
