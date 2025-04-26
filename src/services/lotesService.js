const API_URL = 'http://localhost:3000/lotes'

const getAuthHeaders = () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNzQ1NjI2ODc2LCJleHAiOjE3NDU3MTMyNzYsImp0aSI6IjRjYTRkZDhhLTMzZDUtNGI2ZC04ZTMxLTI2ZGE4Y2IzOGRiZSJ9.2KxlRU3dZUgx7HSiXGCn1PYFGj1PncpaLLdfdZrCExQ'
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const getLotes = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const getLote = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createLote = async (formData) => {
  await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })
}

export const updateLote = async (id, formData) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  })
}

export const deleteLote = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}