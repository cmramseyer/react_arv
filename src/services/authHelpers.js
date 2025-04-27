export const logoutAndRedirect = () => {
  localStorage.removeItem('arv_token')
  window.location.href = '/login' // forzamos redirect
}