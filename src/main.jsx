import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home'
import Estancias from './pages/Estancias'
import Lotes from './pages/Lotes'
import LoteShow from './pages/LoteShow'
import Productos from './pages/Productos'
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
      </Route>
    </Routes>
  </BrowserRouter>
)
