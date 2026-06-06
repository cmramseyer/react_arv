import { React } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Estancias from '@/features/estancias/pages/Estancias'
import EstanciaNew from '@/features/estancias/pages/EstanciaNew'
import EstanciaEdit from '@/features/estancias/pages/EstanciaEdit'
import Lotes from '@/features/lotes/pages/Lotes'
import LoteNew from '@/features/lotes/pages/LoteNew'
import LoteEdit from '@/features/lotes/pages/LoteEdit'
import LoteShow from '@/features/lotes/pages/LoteShow'
import Productos from '@/features/productos/pages/Productos'
import ProductoNew from '@/features/productos/pages/ProductoNew'
import ProductoEdit from '@/features/productos/pages/ProductoEdit'
import OrdenesFumigacion from '@/features/ordenes-fumigacion/pages/OrdenesFumigacion'
import OrdenFumigacionNew from '@/features/ordenes-fumigacion/pages/OrdenFumigacionNew'
import OrdenFumigacionShow from '@/features/ordenes-fumigacion/pages/OrdenFumigacionShow'
import OrdenFumigacionEdit from '@/features/ordenes-fumigacion/pages/OrdenFumigacionEdit'
import OrdenFumigacionTerminar from '@/features/ordenes-fumigacion/pages/OrdenFumigacionTerminar'
import BuscarOrden from '@/features/ordenes-fumigacion/pages/BuscarOrden'
import Facturacion from '@/features/ordenes-fumigacion/pages/Facturacion'
import Estadistica from '@/features/estadisticas/pages/Estadistica'
import Cultivos from '@/features/cultivos/pages/Cultivos'
import CultivoNew from '@/features/cultivos/pages/CultivoNew'
import CultivoEdit from '@/features/cultivos/pages/CultivoEdit'
import Maquinistas from '@/features/maquinistas/pages/Maquinistas'
import MaquinistaNew from '@/features/maquinistas/pages/MaquinistaNew'
import MaquinistaEdit from '@/features/maquinistas/pages/MaquinistaEdit'
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
            <Route path="/ordenes_fumigacion/new" element={<OrdenFumigacionNew />} />
            <Route path="/ordenes_fumigacion/pendiente_factura" element={<Facturacion />} />
            <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
            <Route path="/ordenes_fumigacion/:id/edit" element={<OrdenFumigacionEdit />} />
            <Route path="/ordenes_fumigacion/:id/terminar" element={<OrdenFumigacionTerminar />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)
