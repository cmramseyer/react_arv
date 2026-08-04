import { fetchWithAuth } from '@/services/fetchWithAuth'
import { apiUrl } from '@/services/apiUrl'

const API_URL = apiUrl('informe_orden')

type InformeOrdenParams = {
  mes: number
  anio: number
}

export const solicitarInformeOrden = async ({ mes, anio }: InformeOrdenParams): Promise<Blob> => {
  const url = new URL(API_URL, window.location.origin)
  url.searchParams.set('mes', String(mes))
  url.searchParams.set('anio', String(anio))

  const response = await fetchWithAuth(url.toString())

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.error || 'Error generating informe de ordenes')
  }

  return response.blob()
}
