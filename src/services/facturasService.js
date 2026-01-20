import { fetchWithAuth } from './fetchWithAuth'

const API_URL = `http://${import.meta.env.VITE_API_URL}/facturas_pago`

export const getFacturasPago = async () => {
  const response = await fetchWithAuth(API_URL)
  return await response.json()
}

export const marcarFacturaPagada = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
  })

  return response
}
