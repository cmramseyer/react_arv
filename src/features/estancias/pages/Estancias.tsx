import React from 'react'
import { useNavigate } from 'react-router-dom'
import EstanciaList from '@/features/estancias/components/EstanciaList'
import EstanciaListSkeleton from '@/features/estancias/components/EstanciaListSkeleton'
import { Button } from '@/components/ui/button'
import { useEstanciasQuery, useMutationsEstancia } from '@/features/estancias/hooks/useEstanciaQuery'
import type { EntityId } from '@/utils/types'

export default function Estancias() {
  
  const navigate = useNavigate()

  const estanciasQuery = useEstanciasQuery()

  const { deleteMutation } = useMutationsEstancia()

  const handleDelete = (id: EntityId) => {
    deleteMutation.mutate(id)
  }

  const isDeleting = deleteMutation.isPending
  const deletingId = deleteMutation.variables ?? null

  const handleEdit = (id: EntityId) => {
    navigate(`/estancias/${id}/edit`)
  }

  return (
    <div className="p-4">
      <>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Listado de Estancias</h1>
          <Button onClick={() => navigate('/estancias/new')}>Crear Estancia</Button>
        </div>

        { estanciasQuery.isLoading ? <EstanciaListSkeleton /> :
          estanciasQuery.isError ? (
            <div className="space-y-2">
              <div>Error: {estanciasQuery.error?.message}</div>
              <Button onClick={() => estanciasQuery.refetch()} variant="default">
                Reintentar
              </Button>
            </div>
          ) :
          (estanciasQuery.data ?? []).length === 0 ? (
            <div>No hay estancias</div>
          ) : (
            <EstanciaList
              estancias={estanciasQuery.data ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              deletingId={deletingId}
            />
          )
        }
      </>
    </div>
  )
}
