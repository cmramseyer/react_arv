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
  const token = localStorage.getItem('arv_token')

  const finalOptions = {
    ...restOptions,
    headers: {
      ...(restOptions.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    },
  }

  const res = await fetch(url, finalOptions)

  if (res.status !== 401 || !retryOnUnauthorized) {
    return res
  }

  try {
    await getRefreshedToken()
  } catch (error) {
    logoutAndRedirect()
    return res
  }

  const refreshedToken = localStorage.getItem('arv_token')
  const retryOptions = {
    ...restOptions,
    headers: {
      ...(restOptions.headers || {}),
      Authorization: refreshedToken ? `Bearer ${refreshedToken}` : '',
    },
  }

  const retryResponse = await fetch(url, retryOptions)

  if (retryResponse.status === 401) {
    logoutAndRedirect()
  }

  return retryResponse
}
