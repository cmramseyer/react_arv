import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'
import { createOrdenFumigacion } from '../services/ordenesFumigacionService'
import { useNavigate } from 'react-router-dom'
import DosisFields from '../components/DosisFields'
import SelectField from '../components/SelectField'

export default function OrdenFumigacionNueva() {
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      lote_id: '',
      dosis: [{ producto_id: '', cantidad: '' }]
    }
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
        <SelectField
          label="Estancia"
          name="estancia_id"
          options={estancias}
          register={register}
          required={true}
        />

        <SelectField
          label="Lote"
          name="lote_id"
          options={lotes}
          register={register}
          required={true}
        />

        <DosisFields control={control} register={register} productos={productos} />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Crear Orden
        </button>
      </form>
    </div>
  )
}
