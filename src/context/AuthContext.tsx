import React, { createContext, useContext, useEffect, useState } from 'react'
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getSession()
        if (session) {
          setCsrfToken(session.csrf_token)
          setIsAuthenticated(true)
        }
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
    await signIn(data)
    const session = await getSession()
    if (!session) {
      throw new Error('No se pudo iniciar sesión')
    }

    setCsrfToken(session.csrf_token)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      await signOut()
    } finally {
      clearCsrfToken()
      setIsAuthenticated(false)
      window.location.href = '/login'
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
