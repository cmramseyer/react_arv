import { fetchWithAuth } from './fetchWithAuth'
import { handleResponse } from '../lib/utils'
import { getAuthHeaders } from "./authHelpers"

const API_URL = `http://${import.meta.env.VITE_API_URL}/facturas_pago`
const FACTURAS_URL = `http://${import.meta.env.VITE_API_URL}/facturas`

export const getFacturasPago = async () => {
  const res = await fetchWithAuth(API_URL)
  return handleResponse(res, 'Error fetching pago de factura')
}

export const marcarFacturaPagada = async (id, fechaPago) => {
  const url = new URL(`${FACTURAS_URL}/${id}`)

  if (fechaPago) { url.searchParams.set('fecha_pago', fechaPago)}

  const res = await fetchWithAuth(url.toString(), {
    method: 'PATCH',
  })

  return handleResponse(res, 'Error updating factura')
}
