const API_URL = `http://${import.meta.env.VITE_API_URL}/lotes`

import { fetchWithAuth } from "./fetchWithAuth"

const getAuthHeaders = () => {
  const token = localStorage.getItem('arv_token')
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const getLotes = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const getLotesPorEstancia = async (estancia_id) => {
  const url = new URL(API_URL)
  url.searchParams.append('estancia_id', estancia_id)

  const res = await fetchWithAuth(url.toString(), {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const getLote = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createLote = async (formData) => {
  await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })
}

export const updateLote = async (id, formData) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  })
}

export const deleteLote = async (id) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}