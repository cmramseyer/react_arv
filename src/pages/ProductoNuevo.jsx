import React from 'react'
import { useNavigate } from 'react-router-dom'
import { createProducto } from '../services/productosService'
import { Button } from '@/components/ui/button'
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

      <ProductoForm
        onSubmit={handleCreate}
        submitLabel="Crear"
        actions={(
          <Button type="button" variant="secondary" onClick={() => navigate('/productos')}>
            Volver
          </Button>
        )}
      />
    </div>
  )
}
