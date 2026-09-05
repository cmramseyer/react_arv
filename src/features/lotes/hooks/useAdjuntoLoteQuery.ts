import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getAdjuntosLote, uploadAdjuntoLote, deleteAdjuntoLote } from '@/features/lotes/api/lotesService'

import type { AdjuntoLote } from '@/features/lotes/types'

type UploadAdjuntoLoteMutationVariables = {
  loteId: number | string
  payload: File
}

type DeleteAdjuntoLoteMutationVariables = {
  loteId: number | string
  payload: number | string
}

export const adjuntosLoteQueryKey = (loteId: number | string) => ['adjuntosLote', loteId] as const

export const useAdjuntoLoteQuery = (loteId: number | string, enabled = true) => {
  return useQuery<AdjuntoLote[]>({
    queryKey: adjuntosLoteQueryKey(loteId),
    queryFn: () => getAdjuntosLote(loteId),
    enabled: Boolean(loteId) && enabled
  })
}

export const useUploadAdjuntoLoteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<AdjuntoLote, Error, UploadAdjuntoLoteMutationVariables>({
    mutationFn: ({loteId, payload}) => uploadAdjuntoLote(loteId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: adjuntosLoteQueryKey(variables.loteId)})
    }
  })
}

export const useDeleteAdjuntoLoteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<null, Error, DeleteAdjuntoLoteMutationVariables>({
    mutationFn: ({ loteId, payload }) => deleteAdjuntoLote(loteId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: adjuntosLoteQueryKey(variables.loteId)})
    },
  })
}
