const API_URL = `http://${import.meta.env.VITE_API_URL}/maquinistas`

import { fetchWithAuth } from "@/services/fetchWithAuth"
import { handleResponse } from '@/lib/utils'
import { getAuthJsonHeaders, getAuthOnlyHeaders } from "@/services/authHelpers"

import type { Maquinista } from '../types'
import type { MaquinistaFormValues } from '../schemas/maquinistaSchema'

export const getMaquinistas = async (): Promise<Maquinista[]> => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Maquinista[]>(res, 'Error fetching maquinistas')
}

export const getMaquinista = async(id: number | string): Promise<Maquinista> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Maquinista>(res, 'Error fetching maquinista')
}

export const createMaquinista = async (maquinista: MaquinistaFormValues): Promise<Maquinista> => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ maquinista }),
  })
  return handleResponse<Maquinista>(res, 'Error creating maquinista')
}

export const updateMaquinista = async (id: number | string, maquinista: MaquinistaFormValues): Promise<Maquinista> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ maquinista }),
  })
  return handleResponse<Maquinista>(res, 'Error updating maquinista')
}

export const deleteMaquinista = async (id: number | string): Promise<null> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
  return handleResponse<null>(res, 'Error deleting maquinista')
}
