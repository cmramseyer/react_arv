import { React } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Estancias from './pages/Estancias'
import EstanciaNew from './pages/EstanciaNew'
import EstanciaEdit from './pages/EstanciaEdit'
import Lotes from './pages/Lotes'
import LoteNew from './pages/LoteNew.jsx'
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
import BuscarOrden from './pages/BuscarOrden'
import Facturacion from './pages/Facturacion'
import Estadistica from './pages/Estadistica'
import Cultivos from './pages/Cultivos'
import CultivoNueva from './pages/CultivoNueva'
import CultivoEditar from './pages/CultivoEditar'
import Maquinistas from './pages/Maquinistas'
import MaquinistaNueva from './pages/MaquinistaNueva'
import MaquinistaEditar from './pages/MaquinistaEditar'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/estancias" element={<Estancias />} />
            <Route path="/estancias/new" element={<EstanciaNew />} />
            <Route path="/estancias/:id/edit" element={<EstanciaEdit />} />
            <Route path="/cultivos" element={<Cultivos />} />
            <Route path="/cultivos/nueva" element={<CultivoNueva />} />
            <Route path="/cultivos/:id/editar" element={<CultivoEditar />} />
            <Route path="/maquinistas" element={<Maquinistas />} />
            <Route path="/maquinistas/nueva" element={<MaquinistaNueva />} />
            <Route path="/maquinistas/:id/editar" element={<MaquinistaEditar />} />
            <Route path="/lotes" element={<Lotes />} />
            <Route path="/lotes/:id" element={<LoteShow />} />
            <Route path="/lotes/new" element={<LoteNew />} />
            <Route path="/lotes/:id/editar" element={<LoteEditar />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/nuevo" element={<ProductoNuevo />} />
            <Route path="/productos/:id/editar" element={<ProductoEditar />} />
            <Route path="/estadisticas" element={<Estadistica />} />
            <Route path="/ordenes_fumigacion" element={<OrdenesFumigacion />} />
            <Route path="/buscar_ordenes" element={<BuscarOrden />} />
            <Route path="/ordenes_fumigacion/nueva" element={<OrdenesFumigacionNueva />} />
            <Route path="/ordenes_fumigacion/pendiente_factura" element={<Facturacion />} />
            <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
            <Route path="/ordenes_fumigacion/:id/editar" element={<OrdenFumigacionEditar />} />
            <Route path="/ordenes_fumigacion/:id/terminar" element={<OrdenFumigacionTerminar />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)
