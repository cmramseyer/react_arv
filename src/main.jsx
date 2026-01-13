import { React } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Estancias from './pages/Estancias'
import Lotes from './pages/Lotes'
import LoteNuevo from './pages/LoteNuevo'
import LoteEditar from './pages/LoteEditar'
import LoteShow from './pages/LoteShow'
import Productos from './pages/Productos'
import ProductoNuevo from './pages/ProductoNuevo'
import ProductoEditar from './pages/ProductoEditar'
import OrdenesFumigacion from './pages/OrdenesFumigacion'
import OrdenesFumigacionNueva from './pages/OrdenesFumigacionNueva'
import OrdenFumigacionShow from './pages/OrdenFumigacionShow'
import OrdenFumigacionEditar from './pages/OrdenFumigacionEditar'
import OrdenFumigacionTerminar from './pages/OrdenFumigacionTerminar'
import EstanciaNueva from './pages/EstanciaNueva'
import EstanciaEditar from './pages/EstanciaEditar'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/estancias" element={<Estancias />} />
          <Route path="/estancias/nueva" element={<EstanciaNueva />} />
          <Route path="/estancias/:id/editar" element={<EstanciaEditar />} />
          <Route path="/lotes" element={<Lotes />} />
          <Route path="/lotes/:id" element={<LoteShow />} />
          <Route path="/lotes/nuevo" element={<LoteNuevo />} />
          <Route path="/lotes/:id/editar" element={<LoteEditar />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/nuevo" element={<ProductoNuevo />} />
          <Route path="/productos/:id/editar" element={<ProductoEditar />} />
          <Route path="/ordenes_fumigacion" element={<OrdenesFumigacion />} />
          <Route path="/ordenes_fumigacion/nueva" element={<OrdenesFumigacionNueva />} />
          <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
          <Route path="/ordenes_fumigacion/:id/editar" element={<OrdenFumigacionEditar />} />
          <Route path="/ordenes_fumigacion/:id/terminar" element={<OrdenFumigacionTerminar />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)
