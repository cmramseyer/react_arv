const API_URL = `http://${import.meta.env.VITE_API_URL}/ordenes_fumigacion`

import { fetchWithAuth } from "./fetchWithAuth"

const getAuthHeaders = () => {
  const token = localStorage.getItem('arv_token')
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const getOrdenesFumigacion = async (estado = null) => {
  const url = new URL(API_URL)
  url.searchParams.append('estado', estado)
  const res = await fetchWithAuth(url.toString(), {
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

export const getOrdenesPendientesFacturacion = async () => {
  const response = await fetchWithAuth(`${API_URL}/pendiente_factura`, {
    headers: getAuthHeaders(),
  })
  return await response.json()
}

export const facturarOrdenes = async (payload) => {
  const response = await fetchWithAuth(`http://${import.meta.env.VITE_API_URL}/facturas`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return response
}
