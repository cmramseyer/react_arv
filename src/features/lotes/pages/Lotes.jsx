import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLotesQuery, useLotesByEstanciaQuery, useLoteMutation } from '@/features/lotes/hooks/useLoteQuery'
import { useEstanciasQuery } from '@/hooks/useEstanciaQuery'

import LoteList from '@/features/lotes/components/LoteList'
import { Button } from '@/components/ui/button'
import EstanciaFilterSelect from '@/components/EstanciaFilterSelect'

export default function Lotes() {

  const [ selectedEstanciaId, setSelectedEstanciaId ] = useState('all')

  const navigate = useNavigate()

  const lotesQuery = useLotesQuery()

  const lotesByEstanciaEnabled = selectedEstanciaId !== ''
  const lotesByEstanciaQuery = useLotesByEstanciaQuery(selectedEstanciaId, lotesByEstanciaEnabled)

  const estanciasQuery = useEstanciasQuery()

  const { deleteLoteQuery } = useLoteMutation()


  const handleDelete = async (id) => {
    try {
      await deleteLoteQuery.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting lote:', error)
    }
  }

  const handleShow = (lote) => {
    navigate(`/lotes/${lote.id}`)
  }

  const handleSelectEstancia = (id) => {
    setSelectedEstanciaId(id)
  }

  const handleResetEstancia = () => {
    setSelectedEstanciaId('all')
  }

  const lotes = selectedEstanciaId == 'all' ? 
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

      { lotesQuery.isLoading ? 
        'Cargando...' :
        <LoteList lotes={lotes} onShow={handleShow} onDelete={handleDelete} />
      }
    </div>
  )
}
