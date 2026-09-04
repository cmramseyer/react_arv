import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useLotesQuery, useLotesByEstanciaQuery, useLoteMutation } from '@/features/lotes/hooks/useLoteQuery'
import { useEstanciasQuery } from '@/features/estancias/hooks/useEstanciaQuery'

import LoteList from '@/features/lotes/components/LoteList'
import LoteListSkeleton from '@/features/lotes/components/LoteListSkeleton'
import { Button } from '@/components/ui/button'
import EstanciaFilterSelect from '@/features/estancias/components/EstanciaFilterSelect'
import { toastText } from '@/lib/toast'
import type { EntityId } from '@/utils/types'
import type { Lote } from '@/features/lotes/types'

export default function Lotes() {

  const [ selectedEstanciaId, setSelectedEstanciaId ] = useState<number | string>('all')

  const navigate = useNavigate()

  const lotesQuery = useLotesQuery()

  const lotesByEstanciaEnabled = selectedEstanciaId !== ''
  const lotesByEstanciaQuery = useLotesByEstanciaQuery(selectedEstanciaId, lotesByEstanciaEnabled)

  const estanciasQuery = useEstanciasQuery()

  const { deleteMutation: deleteLoteQuery } = useLoteMutation()


  const handleDelete = async (id: EntityId) => {
    const promise = deleteLoteQuery.mutateAsync(id)
    toast.promise(promise, toastText('lote', 'delete'))
    try {
      await promise
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  const handleShow = (lote: Lote) => {
    navigate(`/lotes/${lote.id}`)
  }

  const handleSelectEstancia = (id: EntityId) => {
    setSelectedEstanciaId(id)
  }

  const handleResetEstancia = () => {
    setSelectedEstanciaId('all')
  }

  const isShowingAll = selectedEstanciaId == 'all'
  const activeQuery = isShowingAll ? lotesQuery : lotesByEstanciaQuery

  const lotes = isShowingAll ?
    lotesQuery.data || [] :
    lotesByEstanciaQuery.data || []
    

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Lotes</h2>

        <Button onClick={() => navigate('/lotes/new')}>Crear lote</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm font-medium">Filtrar por Estancia:</span>
        <div className="flex items-center gap-2">
          <EstanciaFilterSelect
            estancias={estanciasQuery.data || []}
            selectedEstanciaId={selectedEstanciaId}
            onSelect={handleSelectEstancia}
            onResetSelect={handleResetEstancia}
          />
        </div>
      </div>

      { activeQuery.isLoading ?
        <LoteListSkeleton /> :
        activeQuery.isError ? (
          <div className="space-y-2">
            <div>Error: {activeQuery.error?.message}</div>
            <Button onClick={() => activeQuery.refetch()} variant="default">
              Reintentar
            </Button>
          </div>
        ) :
        lotes.length === 0 ? (
          <div>No hay lotes</div>
        ) : (
          <LoteList lotes={lotes} onShow={handleShow} onDelete={handleDelete} />
        )
      }
    </div>
  )
}
