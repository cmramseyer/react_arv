const API_URL = `http://${import.meta.env.VITE_API_URL}`

export type TokenResponse = string | undefined

export const refreshToken = async (): Promise<TokenResponse> => {
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
  } else {
    throw new Error('Token no recibido')
  }

  return data.token
}
