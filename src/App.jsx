import { React } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { logoutAndRedirect } from './services/authHelpers' 
import { useAuth } from './context/AuthContext'

export default function App() {
  const { isAuthenticated, logout } = useAuth()

  const authButton = isAuthenticated ? (
    <button onClick={logout} className="ml-4 text-red-500">
      Sign Out
    </button>
  ) : (
    <Link to="/login" className="ml-4 text-green-500">
      Login
    </Link>
  )

  return (
    <div>
      <nav>
        <Link to="/estancias">Estancias</Link>
        <Link to="/lotes">Lotes</Link>
        <Link to="/productos">Productos</Link>
        <Link to="/ordenes_fumigacion">Ordenes</Link>
        {authButton}
      </nav>
      <hr />
      <Outlet />
    </div>
  )
}
