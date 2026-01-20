import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'

export default function LoteForm({ estancias, onSubmit, defaultValues, submitLabel }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: defaultValues || {}
  })

  useEffect(() => {
    reset(defaultValues || {})
  }, [defaultValues, reset])

  const internalSubmit = async (data) => {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      if (key === 'adjuntos') {
        const files = data.adjuntos
        if (files && files.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append('lote[adjuntos][]', files[i])
          }
        }
      } else {
        // importante: en selects/inputs vacíos puede venir "" — lo mandamos igual
        formData.append(`lote[${key}]`, data[key] ?? '')
      }
    })

    await onSubmit(formData)

    // En crear suele convenir limpiar el form; en editar no necesariamente.
    // Si querés, lo controlás desde el padre. Por ahora no reseteo automáticamente.
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-2 mb-6">

      <select
        {...register('estancia_id', { required: 'La estancia es obligatoria' })}
        className="block border p-1 w-full"
      >
        <option value="">Selecciona una estancia</option>
        {estancias.map((estancia) => (
          <option key={estancia.id} value={estancia.id}>
            {estancia.nombre}
          </option>
        ))}
      </select>
      {errors.estancia_id && <p className="text-red-500">{errors.estancia_id.message}</p>}

      <input
        {...register('nombre', { required: 'El nombre es obligatorio' })}
        placeholder="Nombre del lote"
        className="block border p-1 w-full"
      />
      {errors.nombre && <p className="text-red-500">{errors.nombre.message}</p>}

      <input {...register('lat')} placeholder="Lat" type="number" step="any" className="block border p-1 w-full" />
      <input {...register('long')} placeholder="Long" type="number" step="any" className="block border p-1 w-full" />
      <input {...register('link_mapa')} placeholder="Link mapa" className="block border p-1 w-full" />

      <input
        {...register('hectareas', {
          required: 'Las hectáreas son obligatorias',
          min: { value: 0.01, message: 'Debe ser mayor a 0' },
          max: { value: 10000, message: 'Debe ser menor a 10000' },
          valueAsNumber: true
        })}
        placeholder="Hectareas"
        type="number"
        step="0.01"
        className="block border p-1 w-full"
      />
      {errors.hectareas && <p className="text-red-500">{errors.hectareas.message}</p>}

      <input type="file" multiple {...register('adjuntos')} className="block" />

      <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
        {submitLabel || 'Guardar'}
      </button>
    </form>
  )
}

LoteForm.propTypes = {
  estancias: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,       // recibe FormData ya armado
  defaultValues: PropTypes.object,
  submitLabel: PropTypes.string,
}
