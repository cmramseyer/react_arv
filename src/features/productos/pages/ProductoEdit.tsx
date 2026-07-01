import React from 'react'
import { useParams } from 'react-router-dom'
import ProductoForm from '@/features/productos/components/ProductoForm'

export default function ProductoEdit() {
  const { id } = useParams()

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Producto</h2>

      <ProductoForm formAction="edit" id={id} />
    </div>
  )
}
