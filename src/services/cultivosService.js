const API_URL = `http://${import.meta.env.VITE_API_URL}/cultivos`

import { fetchWithAuth } from "./fetchWithAuth"
import { handleResponse } from "../lib/utils"
import { getAuthHeaders } from "./authHelpers"

export const getCultivos = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching cultivos')
}

export const getCultivo = async(id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching cultivo')
}

export const createCultivo = async (cultivo) => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cultivo }),
  })
  return handleResponse(res, 'Error creating cultivo')
}

export const updateCultivo = async (id, cultivo) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cultivo }),
  })
  return handleResponse(res, 'Error updating cultivo')
}

export const deleteCultivo = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error deleting cultivo')
}