import React, { useEffect, useState, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'

import { getLotes, getLotesPorEstancia, deleteLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'
import LoteList from '../components/LoteList'
import { Button } from '@/components/ui/button'
import EstanciaFilterSelect from '../components/EstanciaFilterSelect'

const lotesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOTES':
      return { ...state, lotes: action.payload, loading: false }
    case 'SET_ESTANCIAS':
      return { ...state, estancias: action.payload }
    case 'SET_SELECTED_ESTANCIA':
      return { ...state, selectedEstanciaId: action.payload }
    default:
      return state
  }
}

export default function Lotes() {
  const initialState = {
    lotes: [],
    estancias: [],
    selectedEstanciaId: '',
    loading: true
  }

  const [state, lotesDispatch] = useReducer(lotesReducer, initialState)
  
  const { lotes, estancias, selectedEstanciaId, loading, modo } = state

  const navigate = useNavigate()

  const fetchLotes = async (estanciaId = '') => {
    const data = estanciaId ? await getLotesPorEstancia(estanciaId) : await getLotes()
    lotesDispatch({ type: 'SET_LOTES', payload: data })
  }

  const fetchEstancias = async () => {
    const data = await getEstancias()
    lotesDispatch({ type: 'SET_ESTANCIAS', payload: data })
  }

  useEffect(() => {
    fetchEstancias()
    fetchLotes()
  }, [])

  useEffect(() => {
    fetchLotes(selectedEstanciaId)
  }, [selectedEstanciaId])

  const handleDelete = async (id) => {
    await deleteLote(id)
    fetchLotes()
  }

  const handleShow = (lote) => {
    navigate(`/lotes/${lote.id}`)
  }

  const handleSelectEstancia = (value) => {

    lotesDispatch({ type: 'SET_SELECTED_ESTANCIA', payload: value === 'all' ? '' : value })
  }

  const handleResetEstancia = () => {
    lotesDispatch({ type: 'SET_SELECTED_ESTANCIA', payload: '' })
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Lotes</h2>

        <Button onClick={() => navigate('/lotes/nuevo')}>Crear lote</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm font-medium">Filtrar por Estancia:</span>
        <div className="flex items-center gap-2">
          <EstanciaFilterSelect
            estancias={estancias}
            selectedEstanciaId={selectedEstanciaId}
            onSelect={handleSelectEstancia}
            onResetSelect={handleResetEstancia}
          />
          
        </div>
      </div>

      <LoteList lotes={lotes} onShow={handleShow} onDelete={handleDelete} />
    </div>
  )
}