const API_URL = 'http://localhost:3000/lotes'

const getAuthHeaders = () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNzQ1NTk5MjE3LCJleHAiOjE3NDU2ODU2MTcsImp0aSI6Ijk3OGQxYTdjLTc0ODAtNGJkMS1hZTRmLTcwN2NmOWZiOThlZiJ9.8fNkfVeyA_Xm_DJdmMe144WVvy8lEh6PY_wyqmiZ9EM'
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