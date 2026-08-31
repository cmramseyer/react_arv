import React, { createContext, useContext, useState } from 'react'
import { signIn } from '../services/loginService'

import type { LoginCredentials } from '../services/loginService'

type AuthContextValue = {
  isAuthenticated: boolean,
  login: (data: LoginCredentials) => Promise<void>,
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = async (data: LoginCredentials): Promise<void> => {
    await signIn(data)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
