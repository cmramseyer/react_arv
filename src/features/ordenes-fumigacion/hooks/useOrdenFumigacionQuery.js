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

export const ordenesFumigacionQueryKey = () => ['ordenesFumigacion']
export const ordenFumigacionQueryKey = (ordenId) => ['ordenFumigacion', ordenId]
export const ordenFumigacionAdjuntosQueryKey = (ordenId) => ['ordenFumigacionAdjuntos', ordenId]
export const ordenFumigacionImprimirQueryKey = (ordenId) => ['ordenFumigacionImprimir', ordenId]
export const ordenesPendientesFacturacionQueryKey = () => ['ordenesPendientesFacturacion']

// GET /ordenes_fumigacion
export function useOrdenesFumigacionQuery() {
  return useQuery({
    queryKey: ordenesFumigacionQueryKey(),
    queryFn: getOrdenesFumigacion
  })
}

// GET /ordenes_fumigacion/:id
export function useOrdenFumigacionQuery(id, enabled = true) {
  return useQuery({
    queryKey: ordenFumigacionQueryKey(id),
    queryFn: () => getOrdenFumigacion(id),
    enabled: Boolean(id) && enabled
  })
}

// GET /ordenes_fumigacion/:id/adjuntos
export function useOrdenFumigacionAdjuntosQuery(ordenId, enabled = true) {
  return useQuery({
    queryKey: ordenFumigacionAdjuntosQueryKey(ordenId),
    queryFn: () => getAdjuntosOrden(ordenId),
    enabled: Boolean(ordenId) && enabled
  })
}

// GET /ordenes_fumigacion/:id/imprimir
export function useOrdenFumigacionImprimirQuery(ordenId, enabled = true) {
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
