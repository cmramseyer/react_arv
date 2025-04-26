const API_URL = 'http://localhost:3000/ordenes_fumigacion'

const getAuthHeaders = () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNzQ1NjI2ODc2LCJleHAiOjE3NDU3MTMyNzYsImp0aSI6IjRjYTRkZDhhLTMzZDUtNGI2ZC04ZTMxLTI2ZGE4Y2IzOGRiZSJ9.2KxlRU3dZUgx7HSiXGCn1PYFGj1PncpaLLdfdZrCExQ'
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const getOrdenesFumigacion = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const getOrdenFumigacion = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createOrdenFumigacion = async (data) => {
  await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: data,
  })
}

export const updateOrdenFumigacion = async (id, data) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: data,
  })
}

export const terminarOrdenFumigacion = async (id, data) => {
  await fetch(`${API_URL}/${id}/terminar`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: data,
  })
}

export const deleteOrdenFumigacion = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}

export const imprimirOrdenFumigacion = async (id) => {
  await fetch(`${API_URL}/${id}/pdf`, {
    headers: getAuthHeaders(),
  })
}
