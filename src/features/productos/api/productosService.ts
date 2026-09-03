import { fetchWithAuth } from "@/services/fetchWithAuth"
import { apiUrl } from "@/services/apiUrl"
import { handleResponse } from "@/lib/utils"
import { getAuthJsonHeaders, getAuthOnlyHeaders } from "@/services/authHelpers"

import type { Producto } from '../types'
import type { ProductoFormValues } from '../schemas/productoSchema'

const API_URL = apiUrl('productos')

export const getProductos = async (): Promise<Producto[]> => {
  const res = await fetchWithAuth(API_URL, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Producto[]>(res, 'Error fetching productos')
}

export const getProducto = async (id: number | string): Promise<Producto> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    headers: getAuthJsonHeaders(),
  })
  return handleResponse<Producto>(res, 'Error fetching producto')
}

export const createProducto = async (producto: ProductoFormValues): Promise<Producto> => {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ producto }),
  })
  return handleResponse<Producto>(res, 'Error creating producto')
}

export const updateProducto = async (id: number | string, producto: ProductoFormValues): Promise<Producto> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthJsonHeaders(),
    body: JSON.stringify({ producto }),
  })
  return handleResponse<Producto>(res, 'Error updating producto')
}

export const deleteProducto = async (id: number | string): Promise<null> => {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthOnlyHeaders(),
  })
  return handleResponse<null>(res, 'Error deleting producto')
}
