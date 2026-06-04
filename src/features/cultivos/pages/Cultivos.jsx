import React from 'react'
import { useNavigate } from 'react-router-dom'
import CultivoList from '@/features/cultivos/components/CultivoList'
import { Button } from '@/components/ui/button'

export default function Cultivos() {
  
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Cultivos</h1>
        <Button onClick={() => navigate('/cultivos/new')}>Crear Cultivo</Button>
      </div>

      <CultivoList />
    </div>
  )
}
