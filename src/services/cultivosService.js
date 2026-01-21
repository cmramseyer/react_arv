const API_URL = `http://${import.meta.env.VITE_API_URL}/cultivos`

import { fetchWithAuth } from "./fetchWithAuth"

const getAuthHeaders = () => {
  const token = localStorage.getItem('arv_token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const getCultivos = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const getCultivo = async(id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Error fetching cultivo')
  return res.json()
}

export const createCultivo = async (cultivo) => {
  await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cultivo }),
  })
}

export const updateCultivo = async (id, cultivo) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cultivo }),
  })
}

export const deleteCultivo = async (id) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}