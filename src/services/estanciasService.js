const API_URL = 'http://localhost:3000/estancias'

import { fetchWithAuth } from "./fetchWithAuth"

const getAuthHeaders = () => {
  const token = localStorage.getItem('arv_token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const getEstancias = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createEstancia = async (estancia) => {
  console.log(estancia)
  await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estancia }),
  })
}

export const updateEstancia = async (id, estancia) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estancia }),
  })
}

export const deleteEstancia = async (id) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}
