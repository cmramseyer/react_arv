const API_URL = `http://${import.meta.env.VITE_API_URL}`

export const refreshToken = async () => {
  const response = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Refresh fallido')
  }

  const data = await response.json()
  if (data?.token) {
    localStorage.setItem('arv_token', data.token)
  }

  return data?.token
}
