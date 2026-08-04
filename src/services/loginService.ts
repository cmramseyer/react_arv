import { handleResponse } from '../lib/utils'
import { apiBaseUrl } from './apiUrl'

const API_URL = apiBaseUrl

export type LoginCredentials = {
  email: string,
  password: string
}

type LoginResponse = {
  token: string
}

export const signIn = async (data: LoginCredentials): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({user: data})
  })

  return handleResponse<LoginResponse>(res, 'Error signin in')
}
