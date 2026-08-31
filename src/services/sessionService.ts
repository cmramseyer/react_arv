import { apiUrl } from './apiUrl'
import { getCsrfToken } from './csrfService'
import { fetchWithAuth } from './fetchWithAuth'

type SessionResponse = {
  csrf_token: string
}

export const getSession = async (): Promise<SessionResponse | null> => {
  const response = await fetchWithAuth(apiUrl('session'))

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('No se pudo verificar la sesión')
  }

  const session = await response.json() as SessionResponse
  if (!session.csrf_token) {
    throw new Error('La sesión no incluyó un token CSRF')
  }

  return session
}

export const signOut = async (): Promise<void> => {
  const csrfToken = getCsrfToken()
  if (!csrfToken) {
    throw new Error('No hay token CSRF para cerrar sesión')
  }

  const response = await fetch(apiUrl('logout'), {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  })

  if (!response.ok) {
    throw new Error('No se pudo cerrar sesión')
  }
}
