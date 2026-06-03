import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrdenesFumigacion,
  getOrdenFumigacion,
  createOrdenFumigacion,
  updateOrdenFumigacion,
  deleteOrdenFumigacion,
  terminarOrdenFumigacion } from '../services/ordenesFumigacionService'

export const ordenesFumigacionQueryKey = () => ['ordenesFumigacion']
export const ordenFumigacionQueryKey = (ordenId) => ['ordenFumigacion', ordenId]

export function useOrdenesFumigacionQuery() {
  return useQuery({
    queryKey: ordenesFumigacionQueryKey(),
    queryFn: getOrdenesFumigacion
  })
}

export function useOrdenFumigacionQuery(id, enabled = true) {
  return useQuery({
    queryKey: ordenFumigacionQueryKey(id),
    queryFn: () => getOrdenFumigacion(id),
    enabled: Boolean(id) && enabled
  })
}

export function useOrdenFumigacionMutation() {
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createOrdenFumigacion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({id, payload}) => updateOrdenFumigacion(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
      await queryClient.invalidateQueries({queryKey: ordenFumigacionQueryKey(variables.id)})
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrdenFumigacion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}