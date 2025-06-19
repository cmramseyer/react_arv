const API_URL = `http://${import.meta.env.VITE_API_URL}`

export const signIn = async(data) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({user: data})
  })

  if (!response.ok) throw new Error('Login fallido')

  return await response.json()
}