const API_URL = `http://${import.meta.env.VITE_API_URL}/ordenes_fumigacion`

import { fetchWithAuth } from "@/services/fetchWithAuth"
import { handleResponse } from "@/lib/utils"
import { getAuthJsonHeaders, getAuthOnlyHeaders } from "@/services/authHelpers"

import type {
  FacturarOrdenesPayload,
  FacturarOrdenesResponse,
  ImprimirOrdenFumigacionResponse,
  OrdenesPendientesFacturacionResponse,
  OrdenFumigacion,
  OrdenFumigacionAdjunto,
  OrdenFumigacionFilters,
  OrdenFumigacionListItem,
  OrdenFumigacionPayload,
  OrdenFumigacionTerminarPayload,
} from '../types'

export const getOrdenesFumigacion = async (filters: OrdenFumigacionFilters = {}): Promise<OrdenFumigacionListItem[]> => {
  const url = new URL(API_URL)

  if (typeof filters === 'string' || filters === null || filters === undefined) {
    if (filters) {
      url.searchParams.append('estado', String(filters))
    }
  } else {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }

  const res = await fetchWithAuth(url.toString(), {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<OrdenFumigacionListItem[]>(res, 'Error fetching ordenes de fumigación')
}

export const getOrdenFumigacion = async (id: number | string): Promise<OrdenFumigacion> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<OrdenFumigacion>(res, 'Error fetching orden de fumigación')
}

export const createOrdenFumigacion = async (payload: OrdenFumigacionPayload): Promise<OrdenFumigacion> => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: {
      ...getAuthOnlyHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<OrdenFumigacion>(res, 'Error creating orden de fumigación')
}

export const updateOrdenFumigacion = async (id: number | string, payload: OrdenFumigacionPayload): Promise<OrdenFumigacion> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      ...getAuthOnlyHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<OrdenFumigacion>(res, 'Error updating orden de fumigación')
}

export const updateAdjuntoOrdenFumigacion = async (id: number | string, file: File): Promise<OrdenFumigacion> => {
  const formData = new FormData()
  formData.append('orden_fumigacion[adjuntos][]', file)

  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthOnlyHeaders(),
    body: formData,
  })
  return handleResponse<OrdenFumigacion>(res, 'Error updating adjunto de orden de fumigación')
}

export const terminarOrdenFumigacion = async (id: number | string, payload: OrdenFumigacionTerminarPayload): Promise<OrdenFumigacion> => {
  const res = await fetchWithAuth(`${API_URL}/${id}/terminar`, {
    method: 'PATCH',
    headers: {
      ...getAuthOnlyHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<OrdenFumigacion>(res, 'Error updating orden de fumigación')
}

export const deleteOrdenFumigacion = async (id: number | string): Promise<void> => {
  await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
}

export const getAdjuntosOrden = async (ordenId: number | string): Promise<OrdenFumigacionAdjunto[]> => {
  const res = await fetchWithAuth(
    `http://${import.meta.env.VITE_API_URL}/adjuntos?orden_fumigacion_id=${ordenId}`,
    {
      headers: getAuthJsonHeaders(),
    }
  )
  return handleResponse<OrdenFumigacionAdjunto[]>(res, 'Error fetching adjuntos de orden de fumigación')
}

export const imprimirOrdenFumigacion = async (id: number | string, attachmentIds: Array<number | string> = []): Promise<ImprimirOrdenFumigacionResponse> => {
  const url = new URL(`${API_URL}/${id}/pdf`)

  if (attachmentIds.length > 0) {
    attachmentIds.forEach((attachmentId) => {
      url.searchParams.append('attachment_ids[]', String(attachmentId))
    })
  }

  const res = await fetchWithAuth(url.toString(), {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<ImprimirOrdenFumigacionResponse>(res, 'Error fetching ordenes de fumigación')
}

export const getOrdenesPendientesFacturacion = async (): Promise<OrdenesPendientesFacturacionResponse> => {
  const res = await fetchWithAuth(`${API_URL}/pendiente_factura`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<OrdenesPendientesFacturacionResponse>(res, 'Error fetching ordenes de fumigación')
}

export const facturarOrdenes = async (payload: FacturarOrdenesPayload): Promise<FacturarOrdenesResponse> => {
  const res = await fetchWithAuth(`http://${import.meta.env.VITE_API_URL}/facturas`, {
    method: 'POST',
    headers: {
      ...getAuthOnlyHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse<FacturarOrdenesResponse>(res, 'Error creating factura')
}
