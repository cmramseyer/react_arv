import { createContext, useContext, useState, useEffect } from 'react'
import { signIn } from '../services/loginService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('arv_token')
    setIsAuthenticated(!!token)
  }, [])

  const login = async (data) => {
    const response = await signIn(data)
    localStorage.setItem('arv_token', response.token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('arv_token')
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)