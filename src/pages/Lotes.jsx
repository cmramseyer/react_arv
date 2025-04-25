import React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getLotes, createLote, updateLote, deleteLote } from '../services/lotesService'

export default function Lotes() {
  const [lotes, setLotes] = useState([])
  const [selected, setSelected] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const fetchLotes = async () => {
    const data = await getLotes()
    setLotes(data)
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

  useEffect(() => {
    fetchLotes()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lotes</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 mb-6">
        <input {...register('nombre')} placeholder="Nombre" className="block border p-1 w-full" />
        <input {...register('lat')} placeholder="Lat" type="number" step="any" className="block border p-1 w-full" />
        <input {...register('long')} placeholder="Long" type="number" step="any" className="block border p-1 w-full" />
        <input {...register('link_mapa')} placeholder="Link mapa" className="block border p-1 w-full" />
        <input {...register('hectareas')} placeholder="Hectareas" type="number" step="any" className="block border p-1 w-full" />
        <input {...register('estancia_id')} placeholder="Estancia ID" className="block border p-1 w-full" />
        <input type="file" multiple {...register('adjuntos')} className="block" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">{selected ? 'Actualizar' : 'Crear'}</button>
      </form>

      <ul className="space-y-2">
        {lotes.map(lote => (
          <li key={lote.id} className="border p-2 rounded">
            <div className="font-bold">{lote.nombre}</div>
            <button onClick={() => handleEdit(lote)} className="text-sm text-blue-600">Editar</button>
            <button onClick={() => handleDelete(lote.id)} className="ml-2 text-sm text-red-600">Eliminar</button>
            <Link to={`/lotes/${lote.id}`} className="ml-2 text-sm text-green-600">Ver</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}