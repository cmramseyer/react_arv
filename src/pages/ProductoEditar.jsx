import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProducto, updateProducto } from '../services/productosService'
import ProductoForm from '../components/ProductoForm'
import { Button } from '@/components/ui/button'

export default function ProductoEditar() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProducto(id)
        setProducto(data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleUpdate = async (data) => {
    await updateProducto(id, data)
    navigate('/productos')
  }

  if (loading) return <div className="p-4">Cargando...</div>
  if (!producto) return <div className="p-4">No se encontró el producto</div>

  const defaultValues = {
    nombre: producto.nombre ?? '',
    tipo_producto: producto.tipo_producto ?? '',
    unidad_medida: producto.unidad_medida ?? '',
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Producto</h2>

      <ProductoForm
        defaultValues={defaultValues}
        onSubmit={handleUpdate}
        submitLabel="Actualizar"
        actions={(
          <Button type="button" variant="secondary" onClick={() => navigate('/productos')}>
            Volver
          </Button>
        )}
      />
    </div>
  )
}
