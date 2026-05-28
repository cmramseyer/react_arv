// src/services/productoService.js
const API_URL = `http://${import.meta.env.VITE_API_URL}/productos` 

import { fetchWithAuth } from "./fetchWithAuth"
import { handleResponse } from "../lib/utils"
import { getAuthJsonHeaders, getAuthOnlyHeaders } from "./authHelpers"

export const getProductos = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse(res, 'Error fetching productos')
}

export const getProducto = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse(res, 'Error fetching producto')
}

export const createProducto = async (producto) => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthOnlyHeaders(),
    body: JSON.stringify({ producto }),
  })
  return handleResponse(res, 'Error creating producto')
}

export const updateProducto = async (id, producto) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthOnlyHeaders(),
    body: JSON.stringify({ producto }),
  })
  return handleResponse(res, 'Error updating producto')
}

export const deleteProducto = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
  return handleResponse(res, 'Error deleting producto')
}
