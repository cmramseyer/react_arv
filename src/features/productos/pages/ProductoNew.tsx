import React from 'react'
import ProductoCreateForm from '@/features/productos/components/ProductoCreateForm'
import { useNavigate } from 'react-router-dom'

export default function ProductoNew() {
  const navigate = useNavigate()
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>

      <ProductoCreateForm
        onSuccess={() => navigate('/productos')}
      />
    </div>
  )
}
