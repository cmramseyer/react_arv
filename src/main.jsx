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
import LoteEdit from './pages/LoteEdit'
import LoteShow from './pages/LoteShow'
import Productos from '@/features/productos/pages/Productos'
import ProductoNew from '@/features/productos/pages/ProductoNew'
import ProductoEdit from '@/features/productos/pages/ProductoEdit'
import OrdenesFumigacion from './pages/OrdenesFumigacion'
import OrdenesFumigacionNueva from './pages/OrdenesFumigacionNueva'
import OrdenFumigacionNew from './pages/OrdenFumigacionNew'
import OrdenFumigacionShow from './pages/OrdenFumigacionShow'
import OrdenFumigacionEditar from './pages/OrdenFumigacionEditar'
import OrdenFumigacionEdit from './pages/OrdenFumigacionEdit'
import OrdenFumigacionTerminar from './pages/OrdenFumigacionTerminar'
import BuscarOrden from './pages/BuscarOrden'
import Facturacion from './pages/Facturacion'
import Estadistica from './pages/Estadistica'
import Cultivos from './pages/Cultivos'
import CultivoNew from './pages/CultivoNew.jsx'
import CultivoEdit from './pages/CultivoEdit.jsx'
import Maquinistas from './pages/Maquinistas'
import MaquinistaNew from './pages/MaquinistaNew.jsx'
import MaquinistaEdit from './pages/MaquinistaEdit.jsx'
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
            <Route path="/cultivos/new" element={<CultivoNew />} />
            <Route path="/cultivos/:id/edit" element={<CultivoEdit />} />
            <Route path="/maquinistas" element={<Maquinistas />} />
            <Route path="/maquinistas/new" element={<MaquinistaNew />} />
            <Route path="/maquinistas/:id/edit" element={<MaquinistaEdit />} />
            <Route path="/lotes" element={<Lotes />} />
            <Route path="/lotes/:id" element={<LoteShow />} />
            <Route path="/lotes/new" element={<LoteNew />} />
            <Route path="/lotes/:id/edit" element={<LoteEdit />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/new" element={<ProductoNew />} />
            <Route path="/productos/:id/edit" element={<ProductoEdit />} />
            <Route path="/estadisticas" element={<Estadistica />} />
            <Route path="/ordenes_fumigacion" element={<OrdenesFumigacion />} />
            <Route path="/buscar_ordenes" element={<BuscarOrden />} />
            <Route path="/ordenes_fumigacion/nueva" element={<OrdenesFumigacionNueva />} />
            <Route path="/orden_fumigacion/new" element={<OrdenFumigacionNew />} />
            <Route path="/ordenes_fumigacion/pendiente_factura" element={<Facturacion />} />
            <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
            <Route path="/ordenes_fumigacion/:id/editar" element={<OrdenFumigacionEditar />} />
            <Route path="/orden_fumigacion/:id/edit" element={<OrdenFumigacionEdit />} />
            <Route path="/ordenes_fumigacion/:id/terminar" element={<OrdenFumigacionTerminar />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)
