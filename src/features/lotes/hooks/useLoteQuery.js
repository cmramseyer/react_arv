import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLote, getLotes, getLotesPorEstancia, updateLote, createLote, deleteLote } from '@/features/lotes/api/lotesService'

export const lotesQueryKey = () => ['lotes']
export const loteByIdQueryKey = (loteId) => ['lote', loteId]
export const lotesByEstanciaIdQueryKey = (estanciaId) => ['lotes', 'estanciaId', estanciaId]

export function useLotesQuery() {
  return useQuery({
    queryKey: lotesQueryKey(),
    queryFn: getLotes
  })
}

export function useLoteQueryById(loteId, enabled = true) {
  return useQuery({
    queryKey: loteByIdQueryKey(loteId),
    queryFn: () => getLote(loteId),
    enabled: Boolean(loteId) && enabled
  })
}

export function useLotesByEstanciaQuery(estanciaId, enabled = true) {
  return useQuery({
    queryKey: lotesByEstanciaIdQueryKey(estanciaId),
    queryFn: () => getLotesPorEstancia(estanciaId),
    enabled: Boolean(estanciaId) && enabled
  })
}

export function useLoteMutation() {
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createLote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: loteByIdQueryKey()})
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({id, payload}) => updateLote(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: loteByIdQueryKey()})
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: loteByIdQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}
