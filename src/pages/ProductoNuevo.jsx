import React from 'react'
import { useNavigate } from 'react-router-dom'
import { createProducto } from '../services/productosService'
import ProductoForm from '../components/ProductoForm'

export default function ProductoNuevo() {
  const navigate = useNavigate()

  const handleCreate = async (data) => {
    await createProducto(data)
    navigate('/productos')
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>

      <ProductoForm onSubmit={handleCreate} submitLabel="Crear" />

      <button className="underline" onClick={() => navigate('/productos')}>
        Volver
      </button>
    </div>
  )
}
