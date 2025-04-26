import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/estancias">Estancias</Link>
        <Link to="/lotes">Lotes</Link>
        <Link to="/productos">Productos</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  )
}
