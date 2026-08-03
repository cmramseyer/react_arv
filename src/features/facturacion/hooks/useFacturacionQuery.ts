import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getOrdenesPendientesFacturacion,
  facturarOrdenes,
} from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'
import {
  getFacturasPago,
  marcarFacturaPagada,
} from '@/features/ordenes-fumigacion/api/facturasService'

import type {
  FacturaPago,
  FacturacionGrupoPendiente,
  FacturacionResponse,
} from '@/features/facturacion/types'
import type {
  FacturarOrdenesPayload,
  FacturarOrdenesResponse,
  OrdenesPendientesFacturacionResponse,
} from '@/features/ordenes-fumigacion/types'

type MarcarFacturaPagadaMutationVariables = {
  facturaId: number | string
  fechaPago: string
}

export const facturacionQueryKey = () => ['facturacion'] as const
export const ordenesPendientesFacturacionQueryKey = () => ['facturacion', 'ordenesPendientes'] as const
export const facturasPagoQueryKey = () => ['facturacion', 'facturasPago'] as const

const normalizarRespuesta = <T>(data: FacturacionResponse): T[] => {
  if (Array.isArray(data)) return data as T[]
  if (Array.isArray(data?.data)) return data.data as T[]
  if (Array.isArray(data?.data?.data)) return data.data.data as T[]
  return []
}

export function useOrdenesPendientesFacturacionQuery(enabled = true) {
  return useQuery<OrdenesPendientesFacturacionResponse, Error, FacturacionGrupoPendiente[]>({
    queryKey: ordenesPendientesFacturacionQueryKey(),
    queryFn: getOrdenesPendientesFacturacion,
    select: (data) => normalizarRespuesta<FacturacionGrupoPendiente>(data),
    enabled,
  })
}

export function useFacturasPagoQuery(enabled = true) {
  return useQuery<FacturaPago[], Error>({
    queryKey: facturasPagoQueryKey(),
    queryFn: getFacturasPago,
    enabled,
  })
}

export function useFacturacionMutation() {
  const queryClient = useQueryClient()

  const facturarMutation = useMutation<FacturarOrdenesResponse, Error, FacturarOrdenesPayload>({
    mutationFn: (payload) => facturarOrdenes(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: facturacionQueryKey() })
    },
  })

  const marcarFacturaPagadaMutation = useMutation<
    void,
    Error,
    MarcarFacturaPagadaMutationVariables
  >({
    mutationFn: ({ facturaId, fechaPago }) => marcarFacturaPagada(facturaId, fechaPago),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: facturacionQueryKey() })
    },
  })

  return { facturarMutation, marcarFacturaPagadaMutation }
}
