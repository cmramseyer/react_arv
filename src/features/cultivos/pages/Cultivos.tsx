import React from 'react'
import { useNavigate } from 'react-router-dom'
import CultivoList from '@/features/cultivos/components/CultivoList'
import CultivoListSkeleton from '@/features/cultivos/components/CultivoListSkeleton'
import { Button } from '@/components/ui/button'
import { useCultivosQuery } from '@/features/cultivos/hooks/useCultivoQuery'
import type { EntityId } from '@/utils/types'

export default function Cultivos() {

  const navigate = useNavigate()

  const cultivosQuery = useCultivosQuery()

  const handleEdit = (id: EntityId) => {
    navigate(`/cultivos/${id}/edit`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Cultivos</h1>
        <Button onClick={() => navigate('/cultivos/new')}>Crear Cultivo</Button>
      </div>

      {cultivosQuery.isLoading ? <CultivoListSkeleton /> :
        cultivosQuery.isError ? (
          <div className="space-y-2">
            <div>Error: {cultivosQuery.error?.message}</div>
            <Button onClick={() => cultivosQuery.refetch()} variant="default">
              Reintentar
            </Button>
          </div>
        ) :
        (cultivosQuery.data ?? []).length === 0 ? (
          <div>No hay cultivos</div>
        ) : (
          <CultivoList
            cultivos={cultivosQuery.data ?? []}
            onEdit={handleEdit}
          />
        )
      }
    </div>
  )
}
