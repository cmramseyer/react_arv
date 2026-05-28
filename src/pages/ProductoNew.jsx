import React from 'react'
import ProductoForm from '../components/ProductoForm'

export default function ProductoNew() {
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>

      <ProductoForm
        formAction='create'
      />
    </div>
  )
}
