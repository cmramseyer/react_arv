import React, { useEffect, useState } from 'react'
import { getOrdenesFumigacion } from '../services/ordenesFumigacionService'
import { Link, useNavigate } from 'react-router-dom'

export default function OrdenesFumigacion() {
  const [ordenes, setOrdenes] = useState([])
  const navigate = useNavigate()

  const fetchOrdenes = async () => {
    const data = await getOrdenesFumigacion()
    setOrdenes(data)
  }

  useEffect(() => {
    fetchOrdenes()
  }, [])

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Órdenes de Fumigación</h2>
        <button
          onClick={() => navigate('/ordenes_fumigacion/nueva')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Crear Nueva Orden
        </button>
      </div>

      <ul className="space-y-2">
        {ordenes.map((orden) => (
          <li key={orden.id} className="border p-4 rounded flex flex-col justify-between md:flex-row">
            <div className="flex-1">
              <div className="font-bold">Orden #{orden.id}</div>
              <div>Estancia: {orden.nombre_estancia}</div>
              <div>Lote: {orden.nombre_lote}</div>
            </div>

            <div className="flex-1">
              <div>Estado: {orden.estado_orden}</div>
              <div>Creado por: {orden.creado_por}</div>
              <div className="hidden md:block">Fecha trabajo: {orden.fecha_trabajo || 'Pendiente'}</div>
            </div>
            
            
            <div className="flex-1 w-full">
              <Link
                to={`/ordenes_fumigacion/${orden.id}`}
                className="inline-block mt-2 text-blue-600 hover:underline"
              >
                Ver Orden
              </Link>
            </div>
            
          </li>
        ))}
      </ul>
    </div>
  )
}