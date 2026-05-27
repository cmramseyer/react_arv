const API_URL = `http://${import.meta.env.VITE_API_URL}/ordenes_fumigacion`

import { fetchWithAuth } from "./fetchWithAuth"
import { handleResponse } from "../lib/utils"
import { getAuthHeaders } from "./authHelpers"

export const getOrdenesFumigacion = async (filters = {}) => {
  const url = new URL(API_URL)

  if (typeof filters === 'string' || filters === null || filters === undefined) {
    if (filters) {
      url.searchParams.append('estado', filters)
    }
  } else {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value)
      }
    })
  }

  const res = await fetchWithAuth(url.toString(), {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching ordenes de fumigación')
}

export const getOrdenFumigacion = async (id) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createOrdenFumigacion = async (payload) => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse(res, 'Error creating orden de fumigación')
}

export const updateOrdenFumigacion = async (id, payload) => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse(res, 'Error updating orden de fumigación')
}

export const updateAdjuntoOrdenFumigacion = async (id, file) => {
  const formData = new FormData()
  formData.append('orden_fumigacion[adjuntos][]', file)

  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  })
  return handleResponse(res, 'Error updating adjunto de orden de fumigación')
}

export const terminarOrdenFumigacion = async (id, payload) => {
  const res = await fetchWithAuth(`${API_URL}/${id}/terminar`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse(res, 'Error updating orden de fumigación')
}

export const deleteOrdenFumigacion = async (id) => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}

export const getAdjuntosOrden = async (ordenId) => {
  const res = await fetchWithAuth(
    `http://${import.meta.env.VITE_API_URL}/adjuntos?orden_fumigacion_id=${ordenId}`,
    {
      headers: getAuthHeaders(),
    }
  )
  return handleResponse(res, 'Error fetching adjuntos de orden de fumigación')
}

export const imprimirOrdenFumigacion = async (id, attachmentIds = []) => {
  const url = new URL(`${API_URL}/${id}/pdf`)

  if (attachmentIds.length > 0) {
    attachmentIds.forEach((attachmentId) => {
      url.searchParams.append('attachment_ids[]', attachmentId)
    })
  }

  const res = await fetchWithAuth(url.toString(), {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching ordenes de fumigación')
}

export const getOrdenesPendientesFacturacion = async () => {
  const res = await fetchWithAuth(`${API_URL}/pendiente_factura`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Error fetching ordenes de fumigación')
}

export const facturarOrdenes = async (payload) => {
  const res = await fetchWithAuth(`http://${import.meta.env.VITE_API_URL}/facturas`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(res, 'Error creating factura')
}
