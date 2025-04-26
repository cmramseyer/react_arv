import React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/productosService'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [selected, setSelected] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const unidadMedidaOptions = [
    { value: 'kg', label: 'Kilogramos' },
    { value: 'gramos', label: 'Gramos' },
    { value: 'litros', label: 'Litros' },
    { value: 'ml', label: 'Mililitros' }
  ]

  const fetchProductos = async () => {
    const data = await getProductos()
    setProductos(data)
  }

  const onSubmit = async (data) => {
    if (selected) {
      await updateProducto(selected.id, data)
    } else {
      await createProducto(data)
    }

    reset()
    setSelected(null)
    fetchProductos()
  }

  const handleEdit = (producto) => {
    setSelected(producto)
    reset(producto)
  }

  const handleDelete = async (id) => {
    await deleteProducto(id)
    fetchProductos()
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Productos</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 mb-6">
        <input
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          placeholder="Nombre"
          className="block border p-1 w-full"
        />
        {errors.nombre && <p className="text-red-500">{errors.nombre.message}</p>}

        <input
          {...register('tipo_producto', { required: 'El tipo de producto es obligatorio' })}
          placeholder="Tipo de producto"
          className="block border p-1 w-full"
        />
        {errors.tipo_producto && <p className="text-red-500">{errors.tipo_producto.message}</p>}

        <select
          {...register('unidad_medida', { required: 'La unidad de medida es obligatoria' })}
          className="block border p-1 w-full"
        >
          <option value="">Selecciona unidad de medida</option>
          {unidadMedidaOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {errors.unidad_medida && <p className="text-red-500">{errors.unidad_medida.message}</p>}

        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
          {selected ? 'Actualizar' : 'Crear'}
        </button>
      </form>

      <ul className="space-y-2">
        {productos.map(producto => (
          <li key={producto.id} className="border p-2 rounded">
            <div className="font-bold">{producto.nombre}</div>
            <div className="text-sm">Tipo: {producto.tipo_producto}</div>
            <div className="text-sm">Unidad: {producto.unidad_medida}</div>
            <button onClick={() => handleEdit(producto)} className="text-sm text-blue-600">Editar</button>
            <button onClick={() => handleDelete(producto.id)} className="ml-2 text-sm text-red-600">Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}