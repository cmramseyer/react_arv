import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductos, deleteProducto } from '../services/productosService'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const navigate = useNavigate()

  const fetchProductos = async () => {
    const data = await getProductos()
    setProductos(data)
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  const handleDelete = async (id) => {
    await deleteProducto(id)
    fetchProductos()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Productos</h2>

        <button
          className="bg-blue-500 text-white px-4 py-1 rounded"
          onClick={() => navigate('/productos/nuevo')}
        >
          Nuevo Producto
        </button>
      </div>

      <ul className="space-y-2">
        {productos.map(producto => (
          <li key={producto.id} className="border p-2 rounded">
            <div className="font-bold">{producto.nombre}</div>
            <div className="text-sm">Tipo: {producto.tipo_producto}</div>
            <div className="text-sm">Unidad: {producto.unidad_medida}</div>

            <button
              onClick={() => navigate(`/productos/${producto.id}/editar`)}
              className="text-sm text-blue-600"
            >
              Editar
            </button>

            <button
              onClick={() => handleDelete(producto.id)}
              className="ml-2 text-sm text-red-600"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
