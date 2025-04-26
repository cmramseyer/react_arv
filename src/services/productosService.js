// src/services/productoService.js
const API_URL = 'http://localhost:3000/productos'

const getAuthHeaders = () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNzQ1NjI2ODc2LCJleHAiOjE3NDU3MTMyNzYsImp0aSI6IjRjYTRkZDhhLTMzZDUtNGI2ZC04ZTMxLTI2ZGE4Y2IzOGRiZSJ9.2KxlRU3dZUgx7HSiXGCn1PYFGj1PncpaLLdfdZrCExQ'
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const getProductos = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const getProducto = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createProducto = async (producto) => {
  await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ producto }),
  })
}

export const updateProducto = async (id, producto) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ producto }),
  })
}

export const deleteProducto = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}
