import { React } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { isAuthenticated, logout } = useAuth()

  const authButton = isAuthenticated ? (
    <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 ml-4">
      Sign Out
    </button>
  ) : (
    <Link to="/login" className="text-sm text-green-500 hover:text-green-700 ml-4">
      Login
    </Link>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/estancias" className="text-sm text-blue-600 hover:text-blue-800">Estancias</Link>
          <Link to="/lotes" className="text-sm text-blue-600 hover:text-blue-800">Lotes</Link>
          <Link to="/productos" className="text-sm text-blue-600 hover:text-blue-800">Productos</Link>
          <Link to="/ordenes_fumigacion" className="text-sm text-blue-600 hover:text-blue-800">Órdenes</Link>
        </div>
        <div>
          {authButton}
        </div>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
