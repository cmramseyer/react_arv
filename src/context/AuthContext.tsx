import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { signIn } from '../services/loginService'
import { clearCsrfToken, setCsrfToken } from '../services/csrfService'
import { getSession, signOut } from '../services/sessionService'

import type { LoginCredentials } from '../services/loginService'

type AuthContextValue = {
  isAuthenticated: boolean,
  isLoading: boolean,
  login: (data: LoginCredentials) => Promise<void>,
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getSession()
        setCsrfToken(session.csrf_token)
        setIsAuthenticated(session.authenticated)
      } catch {
        clearCsrfToken()
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    void loadSession()
  }, [])

  const login = async (data: LoginCredentials): Promise<void> => {
    const bootstrapSession = await getSession()
    setCsrfToken(bootstrapSession.csrf_token)

    await signIn(data)
    const session = await getSession()
    setCsrfToken(session.csrf_token)
    if (!session.authenticated) {
      throw new Error('No se pudo iniciar sesión')
    }

    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      await signOut()
    } finally {
      clearCsrfToken()
      queryClient.clear()
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth necesita AuthProvider")
  }
  return context
}
