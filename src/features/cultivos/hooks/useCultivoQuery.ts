import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getCultivos, getCultivo, createCultivo, updateCultivo, deleteCultivo } from '@/features/cultivos/api/cultivosService'

import type { Cultivo } from '@/features/cultivos/types'
import type { CultivoFormValues } from '@/features/cultivos/schemas/cultivoSchema'

type UpdateCultivoMutationVariables = {
  id: number | string
  payload: CultivoFormValues
}

export const cultivosQueryKey = () => ['cultivos'] as const
export const cultivoQueryKey = (cultivoId: number | string) => ['cultivo', cultivoId] as const

export const useCultivosQuery = () => {
  return useQuery<Cultivo[]>({
    queryKey: cultivosQueryKey(),
    queryFn: getCultivos
  })
}

export const useCultivoQuery = (id: number | string, enabled = true) => {
  return useQuery<Cultivo>({
    queryKey: cultivoQueryKey(id),
    queryFn: () => getCultivo(id),
    enabled: Boolean(id) && enabled
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

  const deleteMutation = useMutation<null, Error, number | string>({
    mutationFn: (id) => deleteCultivo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: cultivosQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}
