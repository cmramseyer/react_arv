const API_URL = 'http://localhost:3000'

export const signIn = async(data) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({user: data})
  })

  if (!response.ok) throw new Error('Login fallido')

  const { token } = await response.json()
  localStorage.setItem('arv_token', token)

}

export const signOut = async() => {
  localStorage.setItem('arv_token', null)
}