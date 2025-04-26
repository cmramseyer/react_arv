const API_URL = 'http://localhost:3000/estancias'

const getAuthHeaders = () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNzQ1NjI2ODc2LCJleHAiOjE3NDU3MTMyNzYsImp0aSI6IjRjYTRkZDhhLTMzZDUtNGI2ZC04ZTMxLTI2ZGE4Y2IzOGRiZSJ9.2KxlRU3dZUgx7HSiXGCn1PYFGj1PncpaLLdfdZrCExQ'
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const getEstancias = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  })
  return await res.json()
}

export const createEstancia = async (estancia) => {
  console.log(estancia)
  await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estancia }),
  })
}

export const updateEstancia = async (id, estancia) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estancia }),
  })
}

export const deleteEstancia = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}
