const API_URL = `http://${import.meta.env.VITE_API_URL}/cultivos`

import { fetchWithAuth } from "@/services/fetchWithAuth"
import { handleResponse } from "@/lib/utils"
import { getAuthJsonHeaders, getAuthOnlyHeaders } from "@/services/authHelpers"

export const getCultivos = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse(res, 'Error fetching cultivos')
}

export const getCultivo = async(id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse(res, 'Error fetching cultivo')
}

export const createCultivo = async (cultivo) => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ cultivo }),
  })
  return handleResponse(res, 'Error creating cultivo')
}

export const updateCultivo = async (id, cultivo) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ cultivo }),
  })
  return handleResponse(res, 'Error updating cultivo')
}

export const deleteCultivo = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
  return handleResponse(res, 'Error deleting cultivo')
}
