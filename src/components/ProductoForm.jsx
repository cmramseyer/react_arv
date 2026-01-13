import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'

const unidadMedidaOptions = [
  { value: 'kg', label: 'Kilogramos' },
  { value: 'gramos', label: 'Gramos' },
  { value: 'litros', label: 'Litros' },
  { value: 'ml', label: 'Mililitros' }
]

export default function ProductoForm({ onSubmit, defaultValues, submitLabel }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: defaultValues || {}
  })

  useEffect(() => {
    reset(defaultValues || {})
  }, [defaultValues, reset])

  return (
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
        {submitLabel || 'Guardar'}
      </button>
    </form>
  )
}

ProductoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,     // (data) => Promise<void>
  defaultValues: PropTypes.object,
  submitLabel: PropTypes.string,
}
