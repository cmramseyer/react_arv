import { React } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home'
import Estancias from './pages/Estancias'
import Lotes from './pages/Lotes'
import LoteShow from './pages/LoteShow'
import Productos from './pages/Productos'
import OrdenesFumigacion from './pages/OrdenesFumigacion'
import OrdenesFumigacionNueva from './pages/OrdenesFumigacionNueva'
import OrdenFumigacionShow from './pages/OrdenFumigacionShow'
import OrdenFumigacionEditar from './pages/OrdenFumigacionEditar'
import OrdenFumigacionTerminar from './pages/OrdenFumigacionTerminar'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/estancias" element={<Estancias />} />
        <Route path="/lotes" element={<Lotes />} />
        <Route path="/lotes/:id" element={<LoteShow />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/ordenes_fumigacion" element={<OrdenesFumigacion />} />
        <Route path="/ordenes_fumigacion/nueva" element={<OrdenesFumigacionNueva />} />
        <Route path="/ordenes_fumigacion/:id" element={<OrdenFumigacionShow />} />
        <Route path="/ordenes_fumigacion/:id/editar" element={<OrdenFumigacionEditar />} />
        <Route path="/ordenes_fumigacion/:id/terminar" element={<OrdenFumigacionTerminar />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
