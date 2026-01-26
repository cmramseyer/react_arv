import { logoutAndRedirect } from './authHelpers'
import { refreshToken } from './refreshService'

// TODO: implementar interceptor con axios

let refreshPromise = null

const getRefreshedToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export const fetchWithAuth = async (url, options = {}) => {
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
