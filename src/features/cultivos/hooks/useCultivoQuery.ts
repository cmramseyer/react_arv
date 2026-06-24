import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getCultivos, getCultivo, createCultivo, updateCultivo, deleteCultivo } from '@/features/cultivos/api/cultivosService'
import { hasId } from '@/utils/types'

import type { Cultivo } from '@/features/cultivos/types'
import type { CultivoFormValues } from '@/features/cultivos/schemas/cultivoSchema'
import type { EntityId, MaybeEntityId } from '@/utils/types'

type UpdateCultivoMutationVariables = {
  id: EntityId
  payload: CultivoFormValues
}

export const cultivosQueryKey = () => ['cultivos'] as const
export const cultivoQueryKey = (cultivoId: EntityId) => ['cultivo', cultivoId] as const

export const useCultivosQuery = () => {
  return useQuery<Cultivo[]>({
    queryKey: cultivosQueryKey(),
    queryFn: getCultivos
  })
}

export const useCultivoQuery = (id: MaybeEntityId, enabled = true) => {
  const queryEnabled = hasId(id) && enabled

  return useQuery<Cultivo>({
    queryKey: ['cultivo', id ?? null] as const,
    queryFn: () => {
      if (!hasId(id)) {
        throw new Error('useCultivoQuery requires an id')
      }

      return getCultivo(id)
    },
    enabled: queryEnabled
  })
}

export const useCultivoMutation = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<Cultivo, Error, CultivoFormValues>({
    mutationFn: (payload) => createCultivo(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: cultivosQueryKey()})
    }
  })

  const updateMutation = useMutation<Cultivo, Error, UpdateCultivoMutationVariables>({
    mutationFn: ({id, payload}) => updateCultivo(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: cultivoQueryKey(variables.id)})
      await queryClient.invalidateQueries({queryKey: cultivosQueryKey()})
    }
  })

  const deleteMutation = useMutation<null, Error, EntityId>({
    mutationFn: (id) => deleteCultivo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: cultivosQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}
