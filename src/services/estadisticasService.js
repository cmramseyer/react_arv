import { fetchWithAuth } from './fetchWithAuth'

const API_URL = `http://${import.meta.env.VITE_API_URL}/estadisticas`

const getAuthHeaders = () => {
  const token = localStorage.getItem('arv_token')
  return {
    Authorization: token ? `Bearer ${token}` : '',
  }
}

export const getEstadisticas = async ({ fechaDesde, fechaHasta }) => {
  const url = new URL(API_URL)
  if (fechaDesde) url.searchParams.append('fecha_desde', fechaDesde)
  if (fechaHasta) url.searchParams.append('fecha_hasta', fechaHasta)

  const response = await fetchWithAuth(url.toString(), {
    headers: getAuthHeaders(),
  })

  return await response.json()
}
