import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLote, getLotes, getLotesPorEstancia, updateLote, createLote, deleteLote } from '@/features/lotes/api/lotesService'

import type { Lote } from '@/features/lotes/types'

type UpdateLoteMutationVariables = {
  id: number | string
  payload: FormData
}

export const lotesQueryKey = () => ['lotes'] as const
export const loteByIdQueryKey = (loteId: number | string) => ['lote', loteId] as const
export const lotesByEstanciaIdQueryKey = (estanciaId: number | string) => ['lotes', 'estanciaId', estanciaId] as const

export function useLotesQuery() {
  return useQuery<Lote[]>({
    queryKey: lotesQueryKey(),
    queryFn: getLotes
  })
}

export function useLoteQueryById(loteId: number | string, enabled = true) {
  return useQuery<Lote>({
    queryKey: loteByIdQueryKey(loteId),
    queryFn: () => getLote(loteId),
    enabled: Boolean(loteId) && enabled
  })
}

export function useLotesByEstanciaQuery(estanciaId: number | string, enabled = true) {
  return useQuery<Lote[]>({
    queryKey: lotesByEstanciaIdQueryKey(estanciaId),
    queryFn: () => getLotesPorEstancia(estanciaId),
    enabled: Boolean(estanciaId) && enabled
  })
}

export function useLoteMutation() {
  const queryClient = useQueryClient()

  const createMutation = useMutation<Lote, Error, FormData>({
    mutationFn: (payload) => createLote(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: lotesQueryKey()})
    }
  })

  const updateMutation = useMutation<Lote, Error, UpdateLoteMutationVariables>({
    mutationFn: ({id, payload}) => updateLote(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: lotesQueryKey()})
      await queryClient.invalidateQueries({queryKey: loteByIdQueryKey(variables.id)})
    }
  })

  const deleteMutation = useMutation<null, Error, number | string>({
    mutationFn: (id) => deleteLote(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: lotesQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}
