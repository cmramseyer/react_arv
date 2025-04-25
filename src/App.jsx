import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/estancias">Estancias</Link>
        <Link to="/lotes">Lotes</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  )
}
