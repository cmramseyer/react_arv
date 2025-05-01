import React, { useEffect, useState } from 'react'
import { getOrdenesFumigacion } from '../services/ordenesFumigacionService'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  const handleVerOrden = (id) => {
    navigate(`/ordenes_fumigacion/${id}`)
  }

  const seleccionadoClass = (boton) => {
    if(boton == estadoOrdenSeleccionada){
      return "default"
    } else {
      return "secondary"
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Órdenes de Fumigación</h2>
        <div>
        <div>
          <div className="flex items-center space-x-2">
          </div>
        </div>
          <Button
            onClick={() => handleEstadoOrdenes('')}
            variant={seleccionadoClass('')}
          >
            Todas
          </Button>
          <Button
            onClick={() => handleEstadoOrdenes('activa')}
            variant={seleccionadoClass('activa')}
          >
            Activas
          </Button>
          <Button
            onClick={() => handleEstadoOrdenes('terminada')}
            variant={seleccionadoClass('terminada')}
          >
            Terminadas
          </Button>
        </div>
        
        <Button
          onClick={() => navigate('/ordenes_fumigacion/nueva')}
          variant="outline"
        >
          Crear Nueva Orden
        </Button>
      </div>

      {ordenes.map((orden) => (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>#{orden.id}</CardTitle>
            <CardDescription>{orden.nombre_estancia} - Lote: {orden.nombre_lote}</CardDescription>
          </CardHeader>
          <CardContent>
            <div>Estado: {orden.estado_orden}</div>
            <div>Hectareas: {orden.hectareas}</div>
            <div>Creado por: {orden.creado_por}</div>
            <div className="hidden md:block">Fecha trabajo: {orden.fecha_trabajo || 'Pendiente'}</div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={ () => handleVerOrden(orden.id)} variant="default">Ver orden</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}