const API_URL = `http://${import.meta.env.VITE_API_URL}/estancias`

import { fetchWithAuth } from "@/services/fetchWithAuth"
import { handleResponse } from "@/lib/utils"
import { getAuthOnlyHeaders, getAuthJsonHeaders } from "@/services/authHelpers"
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'


export type Estancia = {
  id: number,
  nombre: string,
  contacto: string | null,
  telefono: string | null,
  email: string | null,
  created_at: string | null,
  updated_at: string | null
}

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
