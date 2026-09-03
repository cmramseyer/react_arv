import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchWithAuth = vi.fn()

vi.mock('./fetchWithAuth', () => ({ fetchWithAuth }))

describe('sessionService', () => {
  beforeEach(() => {
    fetchWithAuth.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the authentication state and CSRF token without refreshing', async () => {
    fetchWithAuth.mockResolvedValue(new Response(JSON.stringify({
      authenticated: true,
      user: { id: 1 },
      csrf_token: 'csrf-token',
    }), { status: 200 }))
    const { getSession } = await import('./sessionService')

    await expect(getSession()).resolves.toEqual({
      authenticated: true,
      user: { id: 1 },
      csrf_token: 'csrf-token',
    })
    expect(fetchWithAuth).toHaveBeenCalledWith('http://localhost:3000/session', { retryOnUnauthorized: false })
  })

  it('returns an anonymous session while retaining its CSRF token', async () => {
    fetchWithAuth.mockResolvedValue(new Response(JSON.stringify({
      authenticated: false,
      user: null,
      csrf_token: 'csrf-token',
    }), { status: 200 }))
    const { getSession } = await import('./sessionService')

    await expect(getSession()).resolves.toEqual({
      authenticated: false,
      user: null,
      csrf_token: 'csrf-token',
    })
  })

  it('sends the in-memory CSRF token when logging out', async () => {
    const { setCsrfToken } = await import('./csrfService')
    const { signOut } = await import('./sessionService')
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    setCsrfToken('csrf-token')

    await signOut()

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/logout', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-Token': 'csrf-token' },
    })
  })
})
