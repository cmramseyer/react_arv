const API_URL = `http://${import.meta.env.VITE_API_URL}/maquinistas`

import { fetchWithAuth } from "./fetchWithAuth"
import { handleResponse } from '../lib/utils'
import { getAuthHeaders } from "./authHelpers"

export const getMaquinistas = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching maquinistas')
}

export const getMaquinista = async(id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching maquinista')
}

export const createMaquinista = async (maquinista) => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ maquinista }),
  })
  return handleResponse(res, 'Error creating maquinista')
}

export const updateMaquinista = async (id, maquinista) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ maquinista }),
  })
  return handleResponse(res, 'Error updating maquinista')
}

export const deleteMaquinista = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error deleting maquinista')
}