import { fetchWithAuth } from "@/services/fetchWithAuth"
import { apiUrl } from "@/services/apiUrl"
import { handleResponse } from "@/lib/utils"
import { getAuthJsonHeaders, getAuthOnlyHeaders } from "@/services/authHelpers"

import type { Cultivo } from '../types'
import type { CultivoFormValues } from '../schemas/cultivoSchema'

const API_URL = apiUrl('cultivos')

export const getCultivos = async (): Promise<Cultivo[]> => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Cultivo[]>(res, 'Error fetching cultivos')
}

export const getCultivo = async(id: number | string): Promise<Cultivo> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Cultivo>(res, 'Error fetching cultivo')
}

export const createCultivo = async (cultivo: CultivoFormValues): Promise<Cultivo> => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ cultivo }),
  })
  return handleResponse<Cultivo>(res, 'Error creating cultivo')
}

export const updateCultivo = async (id: number | string, cultivo: CultivoFormValues): Promise<Cultivo> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ cultivo }),
  })
  return handleResponse<Cultivo>(res, 'Error updating cultivo')
}

export const deleteCultivo = async (id: number | string): Promise<null> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
  return handleResponse<null>(res, 'Error deleting cultivo')
}
