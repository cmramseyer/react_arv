// src/services/productoService.js
const API_URL = `http://${import.meta.env.VITE_API_URL}/productos` 

import { fetchWithAuth } from "./fetchWithAuth"

const getAuthHeaders = () => {
  const token = localStorage.getItem('arv_token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const getProductos = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const getProducto = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createProducto = async (producto) => {
  await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ producto }),
  })
}

export const updateProducto = async (id, producto) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ producto }),
  })
}

export const deleteProducto = async (id) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}
