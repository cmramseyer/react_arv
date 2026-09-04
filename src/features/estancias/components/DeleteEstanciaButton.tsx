import React from 'react'

import { AsyncButton } from '@/components/ui/async-button'
import { useDeleteEstanciaMutation } from '@/features/estancias/hooks/useEstanciaQuery'
import type { EntityId } from '@/utils/types'

type DeleteEstanciaButtonProps = {
  estanciaId: EntityId
}

export default function DeleteEstanciaButton({ estanciaId }: DeleteEstanciaButtonProps) {
  const deleteMutation = useDeleteEstanciaMutation()

  return (
    <AsyncButton
      variant="default"
      isLoading={deleteMutation.isPending}
      onClick={() => deleteMutation.mutate(estanciaId)}
    >
      Eliminar
    </AsyncButton>
  )
}
