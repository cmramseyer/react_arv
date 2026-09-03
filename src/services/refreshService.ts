import { apiBaseUrl } from './apiUrl'

const API_URL = apiBaseUrl

export const refreshSession = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Refresh fallido')
  }
}
