import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLote, getLotes, getLotesPorEstancia, updateLote, createLote, deleteLote } from '@/features/lotes/api/lotesService'
import { hasId } from '@/utils/types'

import type { Lote } from '@/features/lotes/types'
import type { EntityId, MaybeEntityId } from '@/utils/types'

type UpdateLoteMutationVariables = {
  id: EntityId
  payload: FormData
}

export const lotesQueryKey = () => ['lotes'] as const
export const loteByIdQueryKey = (loteId: EntityId) => ['lote', loteId] as const
export const lotesByEstanciaIdQueryKey = (estanciaId: EntityId) => ['lotes', 'estanciaId', estanciaId] as const

export function useLotesQuery() {
  return useQuery<Lote[]>({
    queryKey: lotesQueryKey(),
    queryFn: getLotes
  })
}

export function useLoteQueryById(loteId: MaybeEntityId, enabled = true) {
  const queryEnabled = hasId(loteId) && enabled

  return useQuery<Lote>({
    queryKey: ['lote', loteId ?? null] as const,
    queryFn: () => {
      if (!hasId(loteId)) {
        throw new Error('useLoteQueryById requires loteId')
      }

      return getLote(loteId)
    },
    enabled: queryEnabled
  })
}

export function useLotesByEstanciaQuery(estanciaId: MaybeEntityId, enabled = true) {
  const queryEnabled = hasId(estanciaId) && enabled

  return useQuery<Lote[]>({
    queryKey: ['lotes', 'estanciaId', estanciaId ?? null] as const,
    queryFn: () => {
      if (!hasId(estanciaId)) {
        throw new Error('useLotesByEstanciaQuery requires estanciaId')
      }

      return getLotesPorEstancia(estanciaId)
    },
    enabled: queryEnabled
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

  const deleteMutation = useMutation<null, Error, EntityId>({
    mutationFn: (id) => deleteLote(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: lotesQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}
