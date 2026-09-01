import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('fetchWithAuth', () => {
  let clearCsrfToken: () => void
  let setCsrfToken: (token: string) => void
  let fetchWithAuth: typeof import('./fetchWithAuth').fetchWithAuth

  beforeEach(async () => {
    vi.resetModules()
    const csrfService = await import('./csrfService')
    const authService = await import('./fetchWithAuth')

    clearCsrfToken = csrfService.clearCsrfToken
    setCsrfToken = csrfService.setCsrfToken
    fetchWithAuth = authService.fetchWithAuth
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds the CSRF header to mutations sent with cookies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    setCsrfToken('csrf-token')

    await fetchWithAuth('/api/lotes/1', { method: 'PATCH' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, options] = fetchMock.mock.calls[0]
    expect(options.credentials).toBe('include')
    expect(options.headers.get('X-CSRF-Token')).toBe('csrf-token')
  })

  it('rejects mutations without a CSRF token before sending a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    clearCsrfToken()

    await expect(fetchWithAuth('/api/lotes', { method: 'POST' })).rejects.toThrow('No hay token CSRF')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shares one refresh and retries each concurrent unauthorized request once', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const [firstResponse, secondResponse] = await Promise.all([
      fetchWithAuth('/api/lotes'),
      fetchWithAuth('/api/cultivos'),
    ])

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(5)
    expect(fetchMock.mock.calls.filter(([url]) => url === 'http://localhost:3000/refresh')).toHaveLength(1)
  })
})
