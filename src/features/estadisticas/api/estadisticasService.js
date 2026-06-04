import { fetchWithAuth } from '@/services/fetchWithAuth'
import { handleResponse } from '@/lib/utils'
import { getAuthJsonHeaders, getAuthOnlyHeaders } from '@/services/authHelpers'

const API_URL = `http://${import.meta.env.VITE_API_URL}/estadisticas`

export const getEstadisticas = async ({ fechaDesde, fechaHasta }) => {
  const url = new URL(API_URL)
  if (fechaDesde) url.searchParams.append('fecha_desde', fechaDesde)
  if (fechaHasta) url.searchParams.append('fecha_hasta', fechaHasta)

  const res = await fetchWithAuth(url.toString(), {
    headers: getAuthJsonHeaders(),
  })

  return handleResponse(res, 'Error fetching estadisticas')
}
