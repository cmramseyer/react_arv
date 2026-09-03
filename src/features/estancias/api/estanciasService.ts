import { fetchWithAuth } from "@/services/fetchWithAuth"
import { apiUrl } from "@/services/apiUrl"
import { handleResponse } from "@/lib/utils"
import { getAuthOnlyHeaders, getAuthJsonHeaders } from "@/services/authHelpers"
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'
import type { Estancia } from '@/features/estancias/types'

const API_URL = apiUrl('estancias')

export const getEstancias = async (): Promise<Estancia[]> => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Estancia[]>(res, 'Error fetching estancias')
}

export const getEstancia = async(id: number | string): Promise<Estancia> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Estancia>(res, 'Error fetching estancias')
}

export const createEstancia = async (estancia: EstanciaFormValues): Promise<Estancia> => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ estancia }),
  })
  return handleResponse<Estancia>(res, 'Error creating estancia')
}

export const updateEstancia = async (id: number | string, estancia: EstanciaFormValues): Promise<Estancia> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ estancia }),
  })
  return handleResponse<Estancia>(res, 'Error updating estancia')
}

export const deleteEstancia = async (id: number | string): Promise<null> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
  return handleResponse<null>(res, 'Error deleting estancia')
}
