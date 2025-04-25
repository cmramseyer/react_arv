import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/estancias">Estancias</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  )
}
