import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrdenFumigacion, terminarOrdenFumigacion } from '../services/ordenesFumigacionService'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'

export default function OrdenFumigacionTerminar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, reset } = useForm()

  const [orden, setOrden] = useState(null)
  const [estanciaNombre, setEstanciaNombre] = useState('')
  const [loteNombre, setLoteNombre] = useState('')
  const [loteHectareas, setLoteHectareas] = useState('')
  const [productos, setProductos] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const ordenData = await getOrdenFumigacion(id)
      setOrden(ordenData)
      reset(ordenData)

      // Fetch nombre de estancia
      const estancias = await getEstancias()
      const estancia = estancias.find(e => e.id === ordenData.estancia_id)
      setEstanciaNombre(estancia ? estancia.nombre : '')

      // Fetch nombre y hectareas de lote
      const lotes = await getLotesPorEstancia(ordenData.estancia_id)
      const lote = lotes.find(l => l.id === ordenData.lote_id)
      if (lote) {
        setLoteNombre(lote.nombre)
        setLoteHectareas(lote.hectareas)
      }

      // Fetch productos para mostrar nombre en dosis
      const productosData = await getProductos()
      setProductos(productosData)
    }
    fetchData()
  }, [id, reset])

  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append('orden_fumigacion[datos_clima]', data.datos_clima || '')
    formData.append('orden_fumigacion[info_trabajo]', data.info_trabajo || '')
    formData.append('orden_fumigacion[fecha_trabajo]', data.fecha_trabajo || '')
    formData.append('orden_fumigacion[maquinista]', data.maquinista || '')

    await terminarOrdenFumigacion(id, formData)
    navigate('/ordenes_fumigacion')
  }

  if (!orden) {
    return <div className="p-4">Cargando...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Terminar Orden de Fumigación</h2>

      {/* Datos fijos no editables */}
      <div className="space-y-2 mb-6">
        <div><strong>Estancia:</strong> {estanciaNombre}</div>
        <div><strong>Lote:</strong> {loteNombre}</div>
        <div><strong>Hectáreas:</strong> {loteHectareas}</div>
        <div><strong>Creado Por:</strong> {orden.creado_por}</div>
        <div><strong>Estado:</strong> {orden.estado_orden}</div>
        <div>
          <strong>Dosis:</strong>
          <ul className="list-disc ml-5">
            {orden.dosis.map((dosi, idx) => {
              const producto = productos.find(p => p.id === dosi.producto_id)
              return (
                <li key={idx}>
                  {producto ? producto.nombre : 'Producto'} - {dosi.cantidad}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Formulario de campos editables */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Datos Clima</label>
          <input {...register('datos_clima')} className="block w-full border p-2" />
        </div>
        <div>
          <label>Info Trabajo</label>
          <input {...register('info_trabajo')} className="block w-full border p-2" />
        </div>
        <div>
          <label>Fecha Trabajo</label>
          <input {...register('fecha_trabajo')} type="date" className="block w-full border p-2" />
        </div>
        <div>
          <label>Maquinista</label>
          <input {...register('maquinista')} className="block w-full border p-2" />
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Confirmar Terminar
        </button>
      </form>
    </div>
  )
}
