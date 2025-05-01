import React, { useEffect, useState } from 'react'
import { getOrdenesFumigacion } from '../services/ordenesFumigacionService'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function OrdenesFumigacion() {
  const [ordenes, setOrdenes] = useState([])
  const navigate = useNavigate()
  const [estadoOrdenSeleccionada, setEstadoOrdenSeleccionada] = useState('activa')

  const fetchOrdenes = async () => {
    const data = await getOrdenesFumigacion(estadoOrdenSeleccionada)
    setOrdenes(data)
  }

  useEffect(() => {
    fetchOrdenes()
  }, [estadoOrdenSeleccionada])

  const handleEstadoOrdenes = async (estado) => {
    setEstadoOrdenSeleccionada(estado)
  }

  const seleccionadoClass = (boton) => {
    if(boton == estadoOrdenSeleccionada){
      return "bg-green-500 border-2 border-black text-white px-4 py-2 rounded"
    } else {
      return "bg-green-500 text-white px-4 py-2 rounded"
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Órdenes de Fumigación</h2>
        <div>
        <Button variant="secondary">Botón secundario</Button>
        <Button variant="default">Botón default</Button>
        <Button variant="outline">Botón outline</Button>
        <Button variant="link">Botón link</Button>
        <Button variant="ghost">Botón ghost</Button>
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
        </div>
          <button
            onClick={() => handleEstadoOrdenes('')}
            className={seleccionadoClass('')}
          >
            Todas
          </button>
          <button
            onClick={() => handleEstadoOrdenes('activa')}
            className={seleccionadoClass('activa')}
          >
            Activas
          </button>
          <button
            onClick={() => handleEstadoOrdenes('terminada')}
            className={seleccionadoClass('terminada')}
          >
            Terminadas
          </button>
        </div>
        
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