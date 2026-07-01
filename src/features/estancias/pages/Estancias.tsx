import React from 'react'
import { useNavigate } from 'react-router-dom'
import EstanciaList from '@/features/estancias/components/EstanciaList'
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

  const deleteErrorMessage = deleteMutation.error?.message ?? ''

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

        { estanciasQuery.error && <div>Error: {estanciasQuery.error.message}</div> }

        { estanciasQuery.isPending ? <div>Cargando...</div> :
          <EstanciaList
            estancias={estanciasQuery.data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleteErrorMessage={deleteErrorMessage}
          />
        }
      </>
    </div>
  )
}
