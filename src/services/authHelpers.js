export const logoutAndRedirect = () => {
  localStorage.removeItem('arv_token')
  window.location.href = '/login' // forzamos redirect
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('arv_token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}