import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getCultivos, getCultivo, createCultivo, updateCultivo, deleteCultivo } from '@/features/cultivos/api/cultivosService'

export const cultivosQueryKey = () => ['cultivos']
export const cultivoQueryKey = (cultivoId) => ['cultivo', cultivoId]

export const useCultivosQuery = () => {
  return useQuery({
    queryKey: cultivosQueryKey(),
    queryFn: getCultivos
  })
}

export const useCultivoQuery = (id, enabled = true) => {
  return useQuery({
    queryKey: cultivoQueryKey(id),
    queryFn: () => getCultivo(id),
    enabled: Boolean(id) && enabled
  })
}

export const useCultivoMutation = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data) => createCultivo(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: cultivosQueryKey()})
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({id, data}) => updateCultivo(id, data),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: cultivoQueryKey(variables.id)})
      await queryClient.invalidateQueries({queryKey: cultivosQueryKey()})
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCultivo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: cultivosQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}
