import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProductoList from '@/features/productos/components/ProductoList'
import { Button } from '@/components/ui/button'

export default function Productos() {

  const navigate = useNavigate()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Productos</h1>

        <Button onClick={() => navigate('/productos/new')}>Crear Producto</Button>
      </div>

      <ProductoList />
    </div>
  )
}
