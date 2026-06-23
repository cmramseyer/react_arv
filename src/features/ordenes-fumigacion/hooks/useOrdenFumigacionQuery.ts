import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrdenesFumigacion,
  getOrdenFumigacion,
  getAdjuntosOrden,
  imprimirOrdenFumigacion,
  getOrdenesPendientesFacturacion,
  facturarOrdenes,
  createOrdenFumigacion,
  updateOrdenFumigacion,
  deleteOrdenFumigacion,
  terminarOrdenFumigacion } from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'

import type {
  OrdenFumigacionId,
  OrdenFumigacionFilters,
  OrdenFumigacionAdjunto,
  OrdenFumigacionPayload,
  OrdenFumigacionTerminarPayload,
  OrdenFumigacionListItem
} from '@/features/ordenes-fumigacion/types'

type UpdateOrdenFumigacionMutationVariables = {
  id: OrdenFumigacionId,
  payload: OrdenFumigacionPayload
}

type TerminarOrdenFumigacionMutationVariables = {
  id: OrdenFumigacionId,
  payload: OrdenFumigacionTerminarPayload
}

export const ordenesFumigacionQueryKey = (filters?: OrdenFumigacionFilters) => ['ordenesFumigacion', filters] as const
export const ordenFumigacionQueryKey = (ordenId: OrdenFumigacionId) => ['ordenFumigacion', ordenId] as const
export const ordenFumigacionAdjuntosQueryKey = (ordenId: OrdenFumigacionId) => ['ordenFumigacionAdjuntos', ordenId] as const
export const ordenFumigacionImprimirQueryKey = (ordenId: OrdenFumigacionId) => ['ordenFumigacionImprimir', ordenId] as const
export const ordenesPendientesFacturacionQueryKey = () => ['ordenesPendientesFacturacion'] as const

// GET /ordenes_fumigacion
export function useOrdenesFumigacionQuery(filters: OrdenFumigacionFilters = {}) {
  return useQuery<OrdenFumigacionListItem[], Error>({
    queryKey: ordenesFumigacionQueryKey(filters),
    queryFn: () => getOrdenesFumigacion(filters)
  })
}

// GET /ordenes_fumigacion/:id
export function useOrdenFumigacionQuery(id: OrdenFumigacionId, enabled = true) {
  return useQuery<OrdenFumigacionListItem>({
    queryKey: ordenFumigacionQueryKey(id),
    queryFn: () => getOrdenFumigacion(id),
    enabled: Boolean(id) && enabled
  })
}

// GET /ordenes_fumigacion/:id/adjuntos
export function useOrdenFumigacionAdjuntosQuery(ordenId: OrdenFumigacionId, enabled = true) {
  return useQuery<OrdenFumigacionAdjunto[]>({
    queryKey: ordenFumigacionAdjuntosQueryKey(ordenId),
    queryFn: () => getAdjuntosOrden(ordenId),
    enabled: Boolean(ordenId) && enabled
  })
}

// GET /ordenes_fumigacion/:id/imprimir
export function useOrdenFumigacionImprimirQuery(ordenId: OrdenFumigacionId, enabled = true) {
  return useQuery({
    queryKey: ordenFumigacionImprimirQueryKey(ordenId),
    queryFn: () => imprimirOrdenFumigacion(ordenId),
    enabled: Boolean(ordenId) && enabled
  })
}

// GET /ordenes_fumigacion/pendiente_factura
export function useOrdenesPendientesFacturacionQuery() {
  return useQuery({
    queryKey: ordenesPendientesFacturacionQueryKey(),
    queryFn: getOrdenesPendientesFacturacion,
  })
}

export function useOrdenFumigacionMutation() {
  
  const queryClient = useQueryClient()

  const createMutation = useMutation<OrdenFumigacionListItem, Error, OrdenFumigacionPayload>({
    mutationFn: createOrdenFumigacion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
    }
  })

  const updateMutation = useMutation<OrdenFumigacionListItem, Error, UpdateOrdenFumigacionMutationVariables>({
    mutationFn: ({id, payload}) => updateOrdenFumigacion(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
      await queryClient.invalidateQueries({queryKey: ordenFumigacionQueryKey(variables.id)})
    }
  })

  const deleteMutation = useMutation<null, Error, number | string>({
    mutationFn: deleteOrdenFumigacion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
    }
  })

  const terminarMutation = useMutation<OrdenFumigacionListItem, Error, TerminarOrdenFumigacionMutationVariables>({
    mutationFn: ({id, payload}) => terminarOrdenFumigacion(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
      await queryClient.invalidateQueries({queryKey: ordenFumigacionQueryKey(variables.id)})
    }
  })

  return { createMutation, updateMutation, deleteMutation, terminarMutation }
}
