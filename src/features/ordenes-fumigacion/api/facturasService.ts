import { fetchWithAuth } from '@/services/fetchWithAuth'
import { apiUrl } from '@/services/apiUrl'
import { handleResponse } from '@/lib/utils'
import { getAuthJsonHeaders } from '@/services/authHelpers'

import type { FacturaPago } from '@/features/facturacion/types'

const API_URL = apiUrl('facturas_pago')
const FACTURAS_URL = apiUrl('facturas')

export const getFacturasPago = async (): Promise<FacturaPago[]> => {
  const res = await fetchWithAuth(API_URL)
  return handleResponse<FacturaPago[]>(res, 'Error fetching pago de factura')
}

export const marcarFacturaPagada = async (
  id: number | string,
  fechaPago: string,
): Promise<void> => {
  const url = new URL(`${FACTURAS_URL}/${id}`, window.location.origin)

  const res = await fetchWithAuth(url.toString(), {
    method: 'PATCH',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({fecha_pago: fechaPago})
  })

  return handleResponse<void>(res, 'Error updating factura')
}
