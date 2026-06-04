import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrdenesFumigacion } from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'
import { Button } from '@/components/ui/button'
import OrdenFumigacionCard from '@/features/ordenes-fumigacion/components/OrdenFumigacionCard'

export default function OrdenesFumigacion() {
  const [ordenes, setOrdenes] = useState([])
  const navigate = useNavigate()
  const [estadoOrdenSeleccionada, setEstadoOrdenSeleccionada] = useState('activa')

  const fetchOrdenes = async () => {
    const data = await getOrdenesFumigacion({ estado: estadoOrdenSeleccionada })
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
    if (boton === estadoOrdenSeleccionada) {
      return 'default'
    }
    return 'secondary'
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold">Órdenes de Fumigación</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-1 md:justify-center">
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

        <div className="flex md:flex-1 md:justify-end">
          <Button onClick={() => navigate('/ordenes_fumigacion/nueva')}>
            Crear Orden
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {ordenes.map((orden) => (
          <OrdenFumigacionCard
            key={orden.id}
            orden={orden}
            onVerOrden={handleVerOrden}
          />
        ))}
      </div>
    </div>
  )
}
