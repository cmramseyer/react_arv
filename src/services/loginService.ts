import { handleResponse } from '../lib/utils'
import { apiBaseUrl } from './apiUrl'

const API_URL = apiBaseUrl

export type LoginCredentials = {
  email: string,
  password: string
}

export const signIn = async (data: LoginCredentials): Promise<void> => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({user: data})
  })

  await handleResponse(res, 'Error signin in')
}
