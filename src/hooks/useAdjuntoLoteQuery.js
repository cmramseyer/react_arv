import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getAdjuntosLote, uploadAdjuntoLote, deleteAdjuntoLote } from '../services/lotesService'

export const adjuntosLoteQueryKey = (loteId) => ['adjuntosLote', loteId]

export const useAdjuntoLoteQuery = (loteId, enabled = true) => {
  return useQuery({
    queryKey: adjuntosLoteQueryKey(loteId),
    queryFn: () => getAdjuntosLote(loteId),
    enabled: Boolean(loteId) && enabled
  })
}

export const useAdjuntoLoteMutation = () => {
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: ({loteId, payload}) => uploadAdjuntoLote(loteId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries(adjuntosLoteQueryKey({queryKey: variables.loteId}))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: ({loteId, payload}) => deleteAdjuntoLote(loteId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries(adjuntosLoteQueryKey({queryKey: variables.loteId}))
    }
  })

  return { uploadMutation, deleteMutation }
}
