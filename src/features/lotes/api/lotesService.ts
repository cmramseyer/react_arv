import { fetchWithAuth } from "@/services/fetchWithAuth"
import { apiUrl } from "@/services/apiUrl"
import { handleResponse } from '@/lib/utils'
import { getAuthOnlyHeaders, getAuthJsonHeaders } from "@/services/authHelpers"

import type { AdjuntoLote, Lote } from '../types'

const API_URL = apiUrl('lotes')

export const getLotes = async (): Promise<Lote[]> => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Lote[]>(res, 'Error fetching lotes')
}

export const getLotesPorEstancia = async (estancia_id: number | string): Promise<Lote[]> => {
  const url = new URL(API_URL, window.location.origin)
  url.searchParams.append('estancia_id', String(estancia_id))

  const res = await fetchWithAuth(url.toString(), {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Lote[]>(res, 'Error fetching lotes por estancia')
}

export const getLote = async (id: number | string): Promise<Lote> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Lote>(res, 'Error fetching lote')
}

export const createLote = async (formData: FormData): Promise<Lote> => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthOnlyHeaders(),
    body: formData,
  })
  return handleResponse<Lote>(res, 'Error creating lote')
}

export const updateLote = async (id: number | string, formData: FormData): Promise<Lote> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthOnlyHeaders(),
    body: formData,
  })
  return handleResponse<Lote>(res, 'Error updating lote')
}

export const deleteLote = async (id: number | string): Promise<null> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders()
  })
  return handleResponse<null>(res, 'Error deleting lote')
}

export const deleteAdjuntoLote = async (loteId: number | string, adjuntoId: number | string): Promise<null> => {
  const res = await fetchWithAuth(`${API_URL}/${loteId}/adjuntos/${adjuntoId}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
  return handleResponse<null>(res, 'Error deleting adjunto')
}

export const uploadAdjuntoLote = async (loteId: number | string, file: File): Promise<AdjuntoLote> => {
  const formData = new FormData()
  formData.append('adjunto', file)

  const res = await fetchWithAuth(`${API_URL}/${loteId}/adjuntos`, {
    method: 'POST',
    headers: getAuthOnlyHeaders(),
    body: formData,
  })
  return handleResponse<AdjuntoLote>(res, 'Error uploading adjunto')
}

export const getAdjuntosLote = async(loteId: number | string): Promise<AdjuntoLote[]> => {
  const res = await fetchWithAuth(`${API_URL}/${loteId}/adjuntos`, {
    method: 'GET',
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<AdjuntoLote[]>(res, 'Error fetching adjuntos lote')
}
