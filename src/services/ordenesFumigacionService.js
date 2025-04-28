const API_URL = 'http://localhost:3000/ordenes_fumigacion'

import { fetchWithAuth } from "./fetchWithAuth"

const getAuthHeaders = () => {
  const token = localStorage.getItem('arv_token')
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const getOrdenesFumigacion = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const getOrdenFumigacion = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createOrdenFumigacion = async (data) => {
  await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: data,
  })
}

export const updateOrdenFumigacion = async (id, data) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: data,
  })
}

export const terminarOrdenFumigacion = async (id, data) => {
  await fetchWithAuth(`${API_URL}/${id}/terminar`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: data,
  })
}

export const deleteOrdenFumigacion = async (id) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}

export const imprimirOrdenFumigacion = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}/pdf`, {
    headers: getAuthHeaders(),
  })
  return await response.json()
}
