import { fetchWithAuth } from './fetchWithAuth'

const API_URL = `http://${import.meta.env.VITE_API_URL}/facturas_pago`
const FACTURAS_URL = `http://${import.meta.env.VITE_API_URL}/facturas`

export const getFacturasPago = async () => {
  const response = await fetchWithAuth(API_URL)
  return await response.json()
}

export const marcarFacturaPagada = async (id, fechaPago) => {
  const url = new URL(`${FACTURAS_URL}/${id}`)

  if (fechaPago) {
    url.searchParams.set('fecha_pago', fechaPago)
  }

  const response = await fetchWithAuth(url.toString(), {
    method: 'PATCH',
  })

  return response
}
