const API_URL = 'http://localhost:3000/estancias'

const getAuthHeaders = () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNzQ1NDY0MTA1LCJleHAiOjE3NDU1NTA1MDUsImp0aSI6IjAxNWNmNjlmLTcxZGItNDY0YS04OGRlLWFmMzhiYWI4YmY1MyJ9.h80HinlcHVxu33m7x6YWoo24YG2SDT2QPavKDJTjR6A'
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const getEstancias = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  })
  debugger;
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
