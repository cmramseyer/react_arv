let csrfToken: string | null = null

export const setCsrfToken = (token: string) => {
  csrfToken = token
}

export const clearCsrfToken = () => {
  csrfToken = null
}

export const getCsrfToken = () => csrfToken
