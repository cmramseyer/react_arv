import React from 'react'
import { useNavigate } from 'react-router-dom'
import MaquinistaList from '@/features/maquinistas/components/MaquinistaList'
import MaquinistaListSkeleton from '@/features/maquinistas/components/MaquinistaListSkeleton'
import { Button } from '@/components/ui/button'
import { useMaquinistasQuery } from '@/features/maquinistas/hooks/useMaquinistaQuery'
import type { EntityId } from '@/utils/types'

export default function Maquinistas() {

  const navigate = useNavigate()

  const maquinistasQuery = useMaquinistasQuery()

  const handleEdit = (id: EntityId) => {
    navigate(`/maquinistas/${id}/edit`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Maquinistas</h1>
        <Button onClick={() => navigate('/maquinistas/new')}>Crear Maquinista</Button>
      </div>

      {maquinistasQuery.isLoading ? <MaquinistaListSkeleton /> :
        maquinistasQuery.isError ? (
          <div className="space-y-2">
            <div>Error: {maquinistasQuery.error?.message}</div>
            <Button onClick={() => maquinistasQuery.refetch()} variant="default">
              Reintentar
            </Button>
          </div>
        ) :
        (maquinistasQuery.data ?? []).length === 0 ? (
          <div>No hay maquinistas</div>
        ) : (
          <MaquinistaList
            maquinistas={maquinistasQuery.data ?? []}
            onEdit={handleEdit}
          />
        )
      }
    </div>
  )
}
