const API_URL = `http://${import.meta.env.VITE_API_URL}/lotes`

import { fetchWithAuth } from "./fetchWithAuth"
import { handleResponse } from '../lib/utils'
import { getAuthHeaders } from "./authHelpers"


export const getLotes = async () => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching lotes')
}

export const getLotesPorEstancia = async (estancia_id) => {
  const url = new URL(API_URL)
  url.searchParams.append('estancia_id', estancia_id)

  const res = await fetchWithAuth(url.toString(), {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching lotes por estancia')
}

export const getLote = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching lote')
}

export const createLote = async (formData) => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })
  return handleResponse(res, 'Error creating lote')
}

export const updateLote = async (id, formData) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  })
  return handleResponse(res, 'Error updating lote')
}

export const deleteLote = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return handleResponse(res, 'Error deleting lote')
}

export const deleteAdjuntoLote = async (loteId, adjuntoId) => {
  const res = await fetchWithAuth(`${API_URL}/${loteId}/adjuntos/${adjuntoId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error deleting adjunto')
}

export const uploadAdjuntoLote = async (loteId, file) => {
  const formData = new FormData()
  formData.append('adjunto', file)

  const res = await fetchWithAuth(`${API_URL}/${loteId}/adjuntos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })
  return handleResponse(res, 'Error uploading adjunto')
}