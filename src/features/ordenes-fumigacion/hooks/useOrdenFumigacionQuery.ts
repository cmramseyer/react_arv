import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrdenesFumigacion,
  getOrdenFumigacion,
  getAdjuntosOrden,
  imprimirOrdenFumigacion,
  getOrdenesPendientesFacturacion,
  createOrdenFumigacion,
  updateOrdenFumigacion,
  deleteOrdenFumigacion,
  terminarOrdenFumigacion } from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'

import type {
  OrdenFumigacion,
  OrdenFumigacionFilters,
  OrdenFumigacionAdjunto,
  OrdenFumigacionPayload,
  OrdenFumigacionTerminarPayload,
} from '@/features/ordenes-fumigacion/types'
import type { EntityId, MaybeEntityId } from '@/utils/types'
import { hasId } from '@/utils/types'

type UpdateOrdenFumigacionMutationVariables = {
  id: EntityId,
  payload: OrdenFumigacionPayload
}

type TerminarOrdenFumigacionMutationVariables = {
  id: EntityId,
  payload: OrdenFumigacionTerminarPayload
}

export const ordenesFumigacionQueryKey = (filters?: OrdenFumigacionFilters) => ['ordenesFumigacion', filters] as const
export const ordenFumigacionQueryKey = (ordenId: EntityId) => ['ordenFumigacion', ordenId] as const
export const ordenFumigacionAdjuntosQueryKey = (ordenId: EntityId) => ['ordenFumigacionAdjuntos', ordenId] as const
export const ordenFumigacionImprimirQueryKey = (ordenId: EntityId) => ['ordenFumigacionImprimir', ordenId] as const
export const ordenesPendientesFacturacionQueryKey = () => ['ordenesPendientesFacturacion'] as const

// GET /ordenes_fumigacion
export function useOrdenesFumigacionQuery(filters: OrdenFumigacionFilters = {}) {
  return useQuery<OrdenFumigacion[], Error>({
    queryKey: ordenesFumigacionQueryKey(filters),
    queryFn: () => getOrdenesFumigacion(filters)
  })
}

// GET /ordenes_fumigacion/:id
export function useOrdenFumigacionQuery(id: MaybeEntityId, enabled = true) {
  const queryEnabled = hasId(id) && enabled

  return useQuery<OrdenFumigacion>({
    queryKey: ['ordenFumigacion', id ?? null] as const,
    queryFn: () => {
      if (!hasId(id)) {
        throw new Error('useOrdenFumigacionQuery requires id')
      }

      return getOrdenFumigacion(id)
    },
    enabled: queryEnabled
  })
}

// GET /ordenes_fumigacion/:id/adjuntos
export function useOrdenFumigacionAdjuntosQuery(ordenId: MaybeEntityId, enabled = true) {
  const queryEnabled = hasId(ordenId) && enabled

  return useQuery<OrdenFumigacionAdjunto[]>({
    queryKey: ['ordenFumigacionAdjuntos', ordenId ?? null] as const,
    queryFn: () => {
      if (!hasId(ordenId)) {
        throw new Error('useOrdenFumigacionAdjuntosQuery requires ordenId')
      }

      return getAdjuntosOrden(ordenId)
    },
    enabled: queryEnabled
  })
}

// GET /ordenes_fumigacion/:id/imprimir
export function useOrdenFumigacionImprimirQuery(ordenId: MaybeEntityId, enabled = true) {
  const queryEnabled = hasId(ordenId) && enabled

  return useQuery({
    queryKey: ['ordenFumigacionImprimir', ordenId ?? null] as const,
    queryFn: () => {
      if (!hasId(ordenId)) {
        throw new Error('useOrdenFumigacionImprimirQuery requires ordenId')
      }

      return imprimirOrdenFumigacion(ordenId)
    },
    enabled: queryEnabled
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

  const createMutation = useMutation<OrdenFumigacion, Error, OrdenFumigacionPayload>({
    mutationFn: createOrdenFumigacion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
    }
  })

  const updateMutation = useMutation<OrdenFumigacion, Error, UpdateOrdenFumigacionMutationVariables>({
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

  const terminarMutation = useMutation<OrdenFumigacion, Error, TerminarOrdenFumigacionMutationVariables>({
    mutationFn: ({id, payload}) => terminarOrdenFumigacion(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: ordenesFumigacionQueryKey()})
      await queryClient.invalidateQueries({queryKey: ordenFumigacionQueryKey(variables.id)})
    }
  })

  return { createMutation, updateMutation, deleteMutation, terminarMutation }
}
