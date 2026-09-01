import { handleResponse } from '../lib/utils'
import { apiUrl } from './apiUrl'
import { fetchWithAuth } from './fetchWithAuth'

export type LoginCredentials = {
  email: string,
  password: string
}

export const signIn = async (data: LoginCredentials): Promise<void> => {
  const res = await fetchWithAuth(apiUrl('login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({user: data}),
    retryOnUnauthorized: false,
  })

  await handleResponse(res, 'Error signin in')
}
