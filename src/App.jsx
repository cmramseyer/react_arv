import { React } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { signOut } from './services/loginService'

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/estancias">Estancias</Link>
        <Link to="/lotes">Lotes</Link>
        <Link to="/productos">Productos</Link>
        <Link to="/ordenes_fumigacion">Ordenes</Link>
        <Link onClick={() => signOut()}to="/">Sign Out</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  )
}
