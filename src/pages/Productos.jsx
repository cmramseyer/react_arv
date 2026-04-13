import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductos, deleteProducto } from '../services/productosService'
import ProductoList from '../components/ProductoList'
import { Button } from '@/components/ui/button'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    const data = await getProductos()
    setProductos(data)
  }

  const handleDelete = async (id) => {
    await deleteProducto(id)
    fetchProductos()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Productos</h1>

        <Button onClick={() => navigate('/productos/nuevo')}>Crear Producto</Button>
      </div>

      <ProductoList
        productos={productos}
        onDelete={handleDelete}
      />
    </div>
  )
}
