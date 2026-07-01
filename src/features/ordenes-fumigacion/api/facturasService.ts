import { fetchWithAuth } from '@/services/fetchWithAuth'
import { handleResponse } from '@/lib/utils'

import type { FacturaPago, MarcarFacturaPagadaResponse } from '@/features/facturacion/types'

const API_URL = `http://${import.meta.env.VITE_API_URL}/facturas_pago`
const FACTURAS_URL = `http://${import.meta.env.VITE_API_URL}/facturas`

export const getFacturasPago = async (): Promise<FacturaPago[]> => {
  const res = await fetchWithAuth(API_URL)
  return handleResponse<FacturaPago[]>(res, 'Error fetching pago de factura')
}

export const marcarFacturaPagada = async (
  id: number | string,
  fechaPago?: string,
): Promise<MarcarFacturaPagadaResponse> => {
  const url = new URL(`${FACTURAS_URL}/${id}`)

  if (fechaPago) { url.searchParams.set('fecha_pago', fechaPago)}

  const res = await fetchWithAuth(url.toString(), {
    method: 'PATCH',
  })

  return handleResponse<MarcarFacturaPagadaResponse>(res, 'Error updating factura')
}
