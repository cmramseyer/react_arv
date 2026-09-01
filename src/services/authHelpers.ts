export const logoutAndRedirect = () => {
  window.location.href = '/login' // forzamos redirect
}

export const getAuthOnlyHeaders = () => ({})

export const getAuthJsonHeaders = () => ({
  'Content-Type': 'application/json',
})

export const getAuthHeaders = getAuthJsonHeaders
