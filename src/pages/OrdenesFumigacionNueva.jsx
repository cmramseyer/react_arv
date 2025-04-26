import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'
import { createOrdenFumigacion } from '../services/ordenesFumigacionService'
import { useNavigate } from 'react-router-dom'

export default function OrdenFumigacionNueva() {
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      lote_id: '',
      dosis: [{ producto_id: '', cantidad: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dosis'
  })

  const [estancias, setEstancias] = useState([])
  const [lotes, setLotes] = useState([])
  const [productos, setProductos] = useState([])
  const navigate = useNavigate()

  const estanciaId = watch('estancia_id')

  useEffect(() => {
    getEstancias().then(setEstancias)
    getProductos().then(setProductos)
  }, [])

  useEffect(() => {
    if (estanciaId) {
      getLotesPorEstancia(estanciaId).then(setLotes)
    } else {
      setLotes([])
    }
  }, [estanciaId])

  const onSubmit = async (data) => {
    const formData = new FormData()

    formData.append('orden_fumigacion[lote_id]', data.lote_id)
    formData.append('orden_fumigacion[creado_por]', 'carlos')
  
    data.dosis.forEach((dosis, index) => {
      if (dosis.producto_id && dosis.cantidad) {
        formData.append(`orden_fumigacion[dosis_attributes][${index}][producto_id]`, dosis.producto_id)
        formData.append(`orden_fumigacion[dosis_attributes][${index}][cantidad]`, dosis.cantidad)
      }
    })
  
    await createOrdenFumigacion(formData)
    navigate('/ordenes_fumigacion')
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nueva Orden de Fumigación</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Estancia</label>
          <select {...register('estancia_id', { required: true })} className="block w-full border p-2">
            <option value="">Seleccione una estancia</option>
            {estancias.map(estancia => (
              <option key={estancia.id} value={estancia.id}>{estancia.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Lote</label>
          <select {...register('lote_id', { required: true })} className="block w-full border p-2">
            <option value="">Seleccione un lote</option>
            {lotes.map(lote => (
              <option key={lote.id} value={lote.id}>{lote.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Dosis</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 mb-2">
              <select {...register(`dosis.${index}.producto_id`, { required: true })} className="border p-2">
                <option value="">Producto</option>
                {productos.map(producto => (
                  <option key={producto.id} value={producto.id}>{producto.nombre}</option>
                ))}
              </select>
              <input
                {...register(`dosis.${index}.cantidad`, { required: true, min: 0.01 })}
                type="number"
                step="0.01"
                placeholder="Cantidad"
                className="border p-2 w-24"
              />
              <button type="button" onClick={() => remove(index)} className="text-red-500">X</button>
            </div>
          ))}

          {fields.length < 10 && (
            <button type="button" onClick={() => append({ producto_id: '', cantidad: '' })} className="text-green-500">
              + Agregar Dosis
            </button>
          )}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Crear Orden
        </button>
      </form>
    </div>
  )
}
