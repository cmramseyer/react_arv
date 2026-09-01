import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  getSession: vi.fn(),
  signOut: vi.fn(),
  setCsrfToken: vi.fn(),
  clearCsrfToken: vi.fn(),
}))

vi.mock('../services/loginService', () => ({ signIn: mocks.signIn }))
vi.mock('../services/sessionService', () => ({
  getSession: mocks.getSession,
  signOut: mocks.signOut,
}))
vi.mock('../services/csrfService', () => ({
  setCsrfToken: mocks.setCsrfToken,
  clearCsrfToken: mocks.clearCsrfToken,
}))

const AuthProbe = () => {
  const { isAuthenticated, isLoading, login, logout } = useAuth()

  return (
    <>
      <output>{isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated'}</output>
      <button onClick={() => void login({ email: 'user@example.com', password: 'secret' })}>
        Login
      </button>
      <button onClick={() => void logout()}>Logout</button>
    </>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderAuthProvider = () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </QueryClientProvider>
    )

    return queryClient
  }

  it('bootstraps an authenticated session and stores its CSRF token in memory', async () => {
    mocks.getSession.mockResolvedValue({ authenticated: true, user: { id: 1 }, csrf_token: 'csrf-token' })

    renderAuthProvider()

    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument())

    expect(mocks.setCsrfToken).toHaveBeenCalledWith('csrf-token')
  })

  it('bootstraps CSRF before logging in and verifies the authenticated session afterwards', async () => {
    mocks.getSession
      .mockResolvedValueOnce({ authenticated: false, user: null, csrf_token: 'initial-csrf-token' })
      .mockResolvedValueOnce({ authenticated: false, user: null, csrf_token: 'login-csrf-token' })
      .mockResolvedValueOnce({ authenticated: true, user: { id: 1 }, csrf_token: 'authenticated-csrf-token' })
    const user = userEvent.setup()

    renderAuthProvider()

    await screen.findByText('unauthenticated')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument())
    expect(mocks.signIn).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret' })
    expect(mocks.setCsrfToken).toHaveBeenNthCalledWith(2, 'login-csrf-token')
    expect(mocks.setCsrfToken).toHaveBeenNthCalledWith(3, 'authenticated-csrf-token')
  })

  it('revokes the remote session and clears cached data on logout', async () => {
    mocks.getSession.mockResolvedValue({ authenticated: true, user: { id: 1 }, csrf_token: 'csrf-token' })
    const queryClient = renderAuthProvider()
    const clear = vi.spyOn(queryClient, 'clear')
    const user = userEvent.setup()

    await screen.findByText('authenticated')
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeInTheDocument())
    expect(mocks.signOut).toHaveBeenCalled()
    expect(mocks.clearCsrfToken).toHaveBeenCalled()
    expect(clear).toHaveBeenCalled()
  })
})
