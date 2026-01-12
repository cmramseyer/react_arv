import React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getLotes, createLote, updateLote, deleteLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'
import LoteList from '../components/LoteList'

export default function Lotes() {
  const [lotes, setLotes] = useState([])
  const [estancias, setEstancias] = useState([])
  const [selected, setSelected] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const navigate = useNavigate()

  const fetchLotes = async () => {
    const data = await getLotes()
    setLotes(data)
  }

  const fetchEstancias = async () => {
    const data = await getEstancias()
    setEstancias(data)
  }  

  const onSubmit = async (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'adjuntos') {
        for (let i = 0; i < data.adjuntos.length; i++) {
          formData.append('lote[adjuntos][]', data.adjuntos[i])
        }
      } else {
        formData.append(`lote[${key}]`, data[key])
      }
    })

    if (selected) {
      await updateLote(selected.id, formData)
    } else {
      await createLote(formData)
    }

    reset()
    setSelected(null)
    fetchLotes()
  }

  const handleEdit = (lote) => {
    setSelected(lote)
    reset(lote)
  }

  const handleDelete = async (id) => {
    await deleteLote(id)
    fetchLotes()
  }

  const handleShow = (lote) => {
    navigate(`/lotes/${lote.id}`)
  }

  useEffect(() => {
    fetchLotes()
    fetchEstancias()
  }, [])

  return (
    <>
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lotes</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 mb-6">
        <input
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          placeholder="Nombre"
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

        <select {...register('estancia_id', { required: 'La estancia es obligatoria' })} className="block border p-1 w-full">
          <option value="">Selecciona una estancia</option>
          {estancias.map(estancia => (
            <option key={estancia.id} value={estancia.id}>
              {estancia.nombre}
            </option>
          ))}
        </select>
        {errors.estancia_id && <p className="text-red-500">{errors.estancia_id.message}</p>}

        <input type="file" multiple {...register('adjuntos')} className="block" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">{selected ? 'Actualizar' : 'Crear'}</button>
      </form>
    </div>
    <LoteList lotes={lotes} onShow={handleShow} onEdit={handleEdit} onDelete={handleDelete} />
    </>
  )
}