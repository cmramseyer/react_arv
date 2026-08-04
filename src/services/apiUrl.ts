export const normalizeApiBaseUrl = (value?: string) => (value?.trim() || '/api').replace(/\/+$/, '')

export const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)

export const apiUrl = (path: string) => `${apiBaseUrl}/${path.replace(/^\/+/, '')}`
