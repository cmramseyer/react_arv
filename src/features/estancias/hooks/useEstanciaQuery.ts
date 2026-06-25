import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEstancia, getEstancias, updateEstancia, createEstancia, deleteEstancia } from '@/features/estancias/api/estanciasService'

import type { Estancia } from '@/features/estancias/types'
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'
import type { EntityId, MaybeEntityId } from '@/utils/types'
import { hasId } from '@/utils/types'

type UpdateEstanciaMutationVariables = { id: EntityId, payload: EstanciaFormValues }

export const estanciasQueryKey = () => ['estancias'] as const
export const estanciaByIdQueryKey = (estanciaId: EntityId) => ['estancia', estanciaId] as const

export function useEstanciasQuery() {
  return useQuery<Estancia[]>({
    queryKey: estanciasQueryKey(),
    queryFn: getEstancias,
  })
}

export function useEstanciaQueryById(estanciaId: MaybeEntityId, enabled = true) {
  const queryEnabled = hasId(estanciaId) && enabled
  return useQuery<Estancia>({
    queryKey: ['estancia', estanciaId ?? null],
    queryFn: () => {
      if(!hasId(estanciaId)){
        throw new Error('useEstanciaQueryById requires estanciaId')
      }
      return getEstancia(estanciaId)
    },
    enabled: queryEnabled
  })
}

export function useMutationsEstancia() {
  const queryClient = useQueryClient()

  const createMutation = useMutation<Estancia, Error, EstanciaFormValues>({
    mutationFn: createEstancia,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: estanciasQueryKey() })
    },
  })

  const updateMutation = useMutation<Estancia, Error, UpdateEstanciaMutationVariables>({
    mutationFn: ({ id, payload }) => updateEstancia(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: estanciasQueryKey() })
      await queryClient.invalidateQueries({ queryKey: estanciaByIdQueryKey(variables.id) })
    },
  })

  const deleteMutation = useMutation<null, Error, EntityId>({
    mutationFn: deleteEstancia,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: estanciasQueryKey() })
    },
  })

  return { createMutation, updateMutation, deleteMutation }
}
