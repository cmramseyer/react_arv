import { logoutAndRedirect } from './authHelpers'
import { refreshToken, type TokenResponse } from './refreshService'

type FetchWithAuthOptions = RequestInit & { retryOnUnauthorized?: boolean }

let refreshPromise: Promise<TokenResponse> | null = null

const getRefreshedToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
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
    await getRefreshedToken()
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
