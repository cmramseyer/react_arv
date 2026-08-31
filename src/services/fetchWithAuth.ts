import { logoutAndRedirect } from './authHelpers'
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

  const finalOptions = {
    ...restOptions,
    credentials: 'include' as const,
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
  }

  const retryResponse = await fetch(url, retryOptions)

  if (retryResponse.status === 401) {
    logoutAndRedirect()
  }

  return retryResponse
}
