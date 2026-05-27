import { handleResponse } from '../lib/utils'

const API_URL = `http://${import.meta.env.VITE_API_URL}`

export const signIn = async(data) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({user: data})
  })

  return handleResponse(res, 'Error signin in')
}
