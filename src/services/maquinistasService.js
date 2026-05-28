const API_URL = `http://${import.meta.env.VITE_API_URL}/maquinistas`

import { fetchWithAuth } from "./fetchWithAuth"
import { handleResponse } from '../lib/utils'
import { getAuthJsonHeaders, getAuthOnlyHeaders } from "./authHelpers"

export const getMaquinistas = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse(res, 'Error fetching maquinistas')
}

export const getMaquinista = async(id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse(res, 'Error fetching maquinista')
}

export const createMaquinista = async (maquinista) => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthOnlyHeaders(),
    body: JSON.stringify({ maquinista }),
  })
  return handleResponse(res, 'Error creating maquinista')
}

export const updateMaquinista = async (id, maquinista) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthOnlyHeaders(),
    body: JSON.stringify({ maquinista }),
  })
  return handleResponse(res, 'Error updating maquinista')
}

export const deleteMaquinista = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
  return handleResponse(res, 'Error deleting maquinista')
}