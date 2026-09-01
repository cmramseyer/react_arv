import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signIn } from './loginService'

const { fetchWithAuth } = vi.hoisted(() => ({ fetchWithAuth: vi.fn() }))

vi.mock('./fetchWithAuth', () => ({ fetchWithAuth }))

describe('loginService', () => {
  beforeEach(() => {
    fetchWithAuth.mockReset()
  })

  it('uses the shared CSRF fetch path without refreshing invalid credentials', async () => {
    fetchWithAuth.mockResolvedValue(new Response(null, { status: 204 }))

    await signIn({ email: 'user@example.com', password: 'secret' })

    expect(fetchWithAuth).toHaveBeenCalledWith('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { email: 'user@example.com', password: 'secret' } }),
      retryOnUnauthorized: false,
    })
  })
})
