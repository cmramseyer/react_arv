import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEstancia, getEstancias, updateEstancia, createEstancia, deleteEstancia } from '@/features/estancias/api/estanciasService'

export const estanciasQueryKey = () => ['estancias']
export const estanciaByIdQueryKey = (estanciaId) => ['estancia', estanciaId]

export function useEstanciasQuery() {
  return useQuery({
    queryKey: estanciasQueryKey(),
    queryFn: getEstancias,
  })
}

export function useEstanciaQueryById(estanciaId, enabled = true) {
  return useQuery({
    queryKey: estanciaByIdQueryKey(estanciaId),
    queryFn: () => getEstancia(estanciaId),
    enabled: Boolean(estanciaId) && enabled
  })
}

export function useMutationsEstancia() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createEstancia,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: estanciasQueryKey() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEstancia(id, payload),
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries({ queryKey: estanciasQueryKey() })
      await queryClient.invalidateQueries({ queryKey: estanciaByIdQueryKey(id) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEstancia,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: estanciasQueryKey() })
    },
  })

  return { createMutation, updateMutation, deleteMutation }
}
