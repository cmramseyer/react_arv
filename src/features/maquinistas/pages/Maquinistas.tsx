import React from 'react'
import { useNavigate } from 'react-router-dom'
import MaquinistaList from '@/features/maquinistas/components/MaquinistaList'
import { Button } from '@/components/ui/button'

export default function Maquinistas() {

  const navigate = useNavigate()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Maquinistas</h1>
        <Button onClick={() => navigate('/maquinistas/new')}>Crear Maquinista</Button>
      </div>

      <MaquinistaList />
    </div>
  )
}
