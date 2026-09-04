import React from 'react'
import { toast } from 'sonner'

import { AsyncButton } from '@/components/ui/async-button'
import { useDeleteEstanciaMutation } from '@/features/estancias/hooks/useEstanciaQuery'
import { toastText } from '@/lib/toast'
import type { EntityId } from '@/utils/types'

type DeleteEstanciaButtonProps = {
  estanciaId: EntityId
}

export default function DeleteEstanciaButton({ estanciaId }: DeleteEstanciaButtonProps) {
  const deleteMutation = useDeleteEstanciaMutation()

  const handleDelete = async () => {
    try {
      await toast.promise(deleteMutation.mutateAsync(estanciaId), toastText('estancia', 'delete'))
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
