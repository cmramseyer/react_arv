import { logoutAndRedirect } from './authHelpers'

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('arv_token')

  const finalOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    },
  }

  const res = await fetch(url, finalOptions)

  if (res.status === 401) {
    logoutAndRedirect()
  }

  return res
}
