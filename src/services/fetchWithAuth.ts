import { logoutAndRedirect } from './authHelpers'
import { getCsrfToken } from './csrfService'
import { refreshSession } from './refreshService'

type FetchWithAuthOptions = RequestInit & { retryOnUnauthorized?: boolean }

let refreshPromise: Promise<void> | null = null

const refreshAuthentication = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export const fetchWithAuth = async (url: string, options: FetchWithAuthOptions = {}) => {
  const { retryOnUnauthorized = true, ...restOptions } = options
  const method = (restOptions.method || 'GET').toUpperCase()
  const headers = new Headers(restOptions.headers)

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken()
    if (!csrfToken) {
      throw new Error('No hay token CSRF para esta operación')
    }

    headers.set('X-CSRF-Token', csrfToken)
  }

  const finalOptions = {
    ...restOptions,
    credentials: 'include' as const,
    headers,
  }

  const res = await fetch(url, finalOptions)

  if (res.status !== 401 || !retryOnUnauthorized) {
    return res
  }

  try {
    await refreshAuthentication()
  } catch {
    logoutAndRedirect()
    return res
  }

  const retryOptions = {
    ...restOptions,
    credentials: 'include' as const,
    headers,
  }

  const retryResponse = await fetch(url, retryOptions)

  if (retryResponse.status === 401) {
    logoutAndRedirect()
  }

  return retryResponse
}
