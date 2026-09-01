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

  it('returns the CSRF token from an authenticated session', async () => {
    fetchWithAuth.mockResolvedValue(new Response(JSON.stringify({ csrf_token: 'csrf-token' }), { status: 200 }))
    const { getSession } = await import('./sessionService')

    await expect(getSession()).resolves.toEqual({ csrf_token: 'csrf-token' })
    expect(fetchWithAuth).toHaveBeenCalledWith('http://localhost:3000/session')
  })

  it('returns null for an unauthenticated session', async () => {
    fetchWithAuth.mockResolvedValue(new Response(null, { status: 401 }))
    const { getSession } = await import('./sessionService')

    await expect(getSession()).resolves.toBeNull()
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
