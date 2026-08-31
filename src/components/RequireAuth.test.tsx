import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RequireAuth } from './RequireAuth'

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }))

vi.mock('@/context/AuthContext', () => ({ useAuth: mocks.useAuth }))

describe('RequireAuth', () => {
  beforeEach(() => {
    mocks.useAuth.mockReset()
  })

  const renderRoute = () => render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/private" element={<div>Contenido privado</div>} />
        </Route>
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  )

  it('waits for the session check before rendering a route', () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: false, isLoading: true })

    renderRoute()

    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
  })

  it('renders protected content for an authenticated session', () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })

    renderRoute()

    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
  })

  it('redirects an unauthenticated session to login', () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })

    renderRoute()

    expect(screen.getByText('Login')).toBeInTheDocument()
  })
})
