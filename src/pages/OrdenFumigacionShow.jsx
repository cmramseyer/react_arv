import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrdenFumigacion, deleteOrdenFumigacion, imprimirOrdenFumigacion } from '../services/ordenesFumigacionService'

export default function OrdenFumigacionShow() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [orden, setOrden] = useState(null)

  useEffect(() => {
    getOrdenFumigacion(id).then(setOrden)
  }, [id])

  const handleEditar = () => {
    navigate(`/ordenes_fumigacion/${id}/editar`)
  }

  const handleTerminar = () => {
    navigate(`/ordenes_fumigacion/${id}/terminar`)
  }

  const handleBorrar = async () => {
    if (confirm('¿Seguro quieres borrar esta orden?')) {
      await deleteOrdenFumigacion(id)
      navigate('/ordenes_fumigacion')
    }
  }

  const handleImprimir = async () => {
    await imprimirOrdenFumigacion(id)
    navigate('/ordenes_fumigacion')
  }

  if (!orden) {
    return <div className="p-4">Cargando...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Orden #{orden.id}</h2>
      <p><strong>Estado:</strong> {orden.estado_orden}</p>
      <p><strong>Estancia:</strong> {orden.nombre_estancia}</p>
      <p><strong>Lote:</strong> {orden.nombre_lote}</p>
      <p><strong>Creado por:</strong> {orden.creado_por}</p>
      <p><strong>Fecha de Creación:</strong> {new Date(orden.created_at).toLocaleString()}</p>
      <p><strong>Maquinista:</strong> {orden.maquinista}</p>
      <p><strong>Info Trabajo:</strong> {orden.info_trabajo}</p>
      <p><strong>Datos Clima:</strong> {orden.datos_clima}</p>

      <h3 className="font-semibold mt-4">Dosis</h3>
      <ul className="list-disc list-inside">
        {orden.dosis.map((dosis, idx) => (
          <li key={idx}>{dosis.producto} - {dosis.cantidad} - {dosis.unidad_medida}</li>
        ))}
      </ul>

      <div className="space-x-2 mt-6">
        <button onClick={handleEditar} className="bg-yellow-500 text-white px-4 py-2 rounded">Editar</button>
        <button onClick={handleTerminar} className="bg-green-600 text-white px-4 py-2 rounded">Terminar</button>
        <button onClick={handleBorrar} className="bg-red-600 text-white px-4 py-2 rounded">Borrar</button>
        <button
          type="button"
          onClick={async () => {
            await imprimirOrdenFumigacion(id)
            navigate('/ordenes_fumigacion')
          }}
          className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded ${orden.estado_orden !== 'activa' ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={orden.estado_orden !== 'activa'}
        >
          Imprimir Orden
        </button>
      </div>
    </div>
  )
}
