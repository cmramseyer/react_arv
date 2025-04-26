import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrdenFumigacion, updateOrdenFumigacion } from '../services/ordenesFumigacionService'
import { getProductos } from '../services/productosService'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'

export default function OrdenFumigacionEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, control, watch, reset, setValue } = useForm({
    defaultValues: {
      estancia_id: '',
      lote_id: '',
      dosis: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dosis'
  })

  const [productos, setProductos] = useState([])
  const [estancias, setEstancias] = useState([])
  const [lotes, setLotes] = useState([])

  const estanciaId = watch('estancia_id')

  useEffect(() => {
    getEstancias().then(setEstancias)
    getProductos().then(setProductos)
  }, [])

  useEffect(() => {
    if (estanciaId) {
      getLotesPorEstancia(estanciaId).then(setLotes)
    }
  }, [estanciaId])

  useEffect(() => {
    const fetchData = async () => {
      const estanciasData = await getEstancias()
      const productosData = await getProductos()
  
      setEstancias(estanciasData)
      setProductos(productosData)
  
      const orden = await getOrdenFumigacion(id)
  
      if (orden.estancia_id) {
        const lotesData = await getLotesPorEstancia(orden.estancia_id)
        setLotes(lotesData)
      }
  
      reset({
        estancia_id: orden.estancia_id,
        lote_id: orden.lote_id,
        datos_clima: orden.datos_clima,
        info_trabajo: orden.info_trabajo,
        creado_por: orden.creado_por,
        fecha_trabajo: orden.fecha_trabajo,
        maquinista: orden.maquinista,
        dosis: orden.dosis?.map(d => ({
          id: d.id,
          producto_id: d.producto_id,
          cantidad: d.cantidad
        })) || []
      })
    }
  
    fetchData()
  }, [id, reset, setValue])

  useEffect(() => {
    if (lotes.length > 0) {
      setValue('lote_id', watch('lote_id'))
    }
  }, [lotes, setValue, watch])
  
  
  const onSubmit = async (data) => {
    const formData = new FormData()

    console.log(data)

    formData.append('orden_fumigacion[lote_id]', data.lote_id)
    formData.append('orden_fumigacion[creado_por]', data.creado_por)
    formData.append('orden_fumigacion[datos_clima]', data.datos_clima || '')
    formData.append('orden_fumigacion[info_trabajo]', data.info_trabajo || '')
    formData.append('orden_fumigacion[fecha_trabajo]', data.fecha_trabajo || '')
    formData.append('orden_fumigacion[maquinista]', data.maquinista || '')

    data.dosis.forEach((dosis, index) => {
      if (dosis._destroy) {
        formData.append(`orden_fumigacion[dosis_attributes][${index}][id]`, dosis.id)
        formData.append(`orden_fumigacion[dosis_attributes][${index}][_destroy]`, '1')
      } else {
        if (dosis.id) {
          formData.append(`orden_fumigacion[dosis_attributes][${index}][id]`, dosis.id)
        }
        formData.append(`orden_fumigacion[dosis_attributes][${index}][producto_id]`, dosis.producto_id)
        formData.append(`orden_fumigacion[dosis_attributes][${index}][cantidad]`, dosis.cantidad)
      }
    })

    await updateOrdenFumigacion(id, formData)
    navigate('/ordenes_fumigacion')
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Orden de Fumigación</h2>

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
          <label>Creado Por</label>
          <input {...register('creado_por')} disabled className="block w-full border p-2 bg-gray-100" />
        </div>

        <div>
          <label>Datos Clima</label>
          <input {...register('datos_clima')} disabled className="block w-full border p-2 bg-gray-100" />
        </div>

        <div>
          <label>Info Trabajo</label>
          <input {...register('info_trabajo')} disabled className="block w-full border p-2 bg-gray-100" />
        </div>

        <div>
          <label>Fecha Trabajo</label>
          <input {...register('fecha_trabajo')} disabled className="block w-full border p-2 bg-gray-100" />
        </div>

        <div>
          <label>Maquinista</label>
          <input {...register('maquinista')} disabled className="block w-full border p-2 bg-gray-100" />
        </div>
        

        <div>
          <label>Dosis</label>
          {fields.map((field, index) => {
            const isDeleted = watch(`dosis.${index}._destroy`);
            if (isDeleted) return null; // ⬅️ Oculta el row si está marcado para eliminar

            return (
              <div key={field.id} className="flex space-x-2 mb-2">
                <select {...register(`dosis.${index}.producto_id`)} className="border p-2">
                  <option value="">Producto</option>
                  {productos.map(producto => (
                    <option key={producto.id} value={producto.id}>{producto.nombre}</option>
                  ))}
                </select>
                <input
                  {...register(`dosis.${index}.cantidad`)}
                  type="number"
                  step="0.01"
                  placeholder="Cantidad"
                  className="border p-2 w-24"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentDosis = fields[index];
                    if (currentDosis.id) {
                      setValue(`dosis.${index}._destroy`, true); // Marcar como eliminada
                    } else {
                      remove(index); // Dosis nueva => borrar directamente
                    }
                  }}
                  className="text-red-500 font-bold px-2"
                >
                  X
                </button>
              </div>
            )
          })}


          {/* Botón para agregar una nueva dosis */}
          {fields.length < 10 && (
            <button
              type="button"
              onClick={() => append({ producto_id: '', cantidad: '' })}
              className="text-green-500 mt-2"
            >
              + Agregar Dosis
            </button>
          )}
        </div>



        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Guardar Cambios
        </button>
      </form>
    </div>
  )
}
