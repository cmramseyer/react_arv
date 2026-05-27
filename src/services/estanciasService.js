const API_URL = `http://${import.meta.env.VITE_API_URL}/estancias`

import { fetchWithAuth } from "./fetchWithAuth"
import { handleResponse } from "../lib/utils"
import { getAuthHeaders } from "./authHelpers"

export const getEstancias = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching estancias')
}

export const getEstancia = async(id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching estancias')
}

export const createEstancia = async (estancia) => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estancia }),
  })
  return handleResponse(res, 'Error creating estancia')
}

export const updateEstancia = async (id, estancia) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estancia }),
  })
  return handleResponse(res, 'Error updating estancia')
}

export const deleteEstancia = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error deleting estancia')
}
