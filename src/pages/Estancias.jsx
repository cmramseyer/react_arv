import React, { useEffect, useState, useReducer } from 'react'
import { getEstancias, deleteEstancia } from '../services/estanciasService'
import EstanciaList from '../components/EstanciaList'
import EstanciaForm from '@/components/EstanciaForm'
import { Button } from '@/components/ui/button'

const estanciaReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ESTANCIAS':
      return { ...state, 
        estancias: action.payload,
        loading: false,
        modo: 'list',
        selectedId: null
      }
    case 'EDIT_ESTANCIA':
      return { ...state, 
        modo: 'edit',
        selectedId: action.payload
      }
    case 'CREATE_ESTANCIA':
      return { ...state, 
        modo: 'create',
        selectedId: null,
        loading: false
      }
    case 'SAVED':
      return { ...state, 
        modo: 'list',
        selectedId: null
      }
    case 'CANCEL':
      return { ...state, 
        modo: 'list',
        selectedId: null
      }
    default:
      return state
  }
}

export default function Estancias() {
  const initialState = {
    estancias: [],
    loading: true,
    selectedId: null,
    modo: 'list'
  }

  const [state, estanciaDispatch] = useReducer(estanciaReducer, initialState)

  const { estancias, loading, selectedId, modo } = state

  useEffect(() => {
    fetchEstancias()
  }, [])

  const fetchEstancias = async () => {
    const data = await getEstancias()
    estanciaDispatch({type: 'SET_ESTANCIAS', payload: data})
  }

  const handleDelete = async (id) => {
    await deleteEstancia(id)
    fetchEstancias()
  }

  const onSelectedIdChange = (id) => {
    estanciaDispatch({type: 'EDIT_ESTANCIA', payload: id})
  }

  const handleFormSaved = async () => {
    await fetchEstancias()
    estanciaDispatch({type: 'SAVED'})
  }

  const handleCancel = async () => {
    estanciaDispatch({type: 'CANCEL'})
  }

  if (loading) return <div>Cargando...</div>

  const editForm = (
    <div>
      <h2>Editar Estancia</h2>
      <EstanciaForm
        action="edit"
        estanciaId={selectedId}
        onSaved={handleFormSaved}
      />
    </div>
  )

  const newForm = (
    <div>
      <h2>Crear Estancia</h2>
      <EstanciaForm
        action="create"
        onSaved={handleFormSaved}
      />
    </div>
  )

  const listView = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Estancias</h1>
        <Button onClick={() => estanciaDispatch({type: 'CREATE_ESTANCIA'})}>Crear Estancia</Button>
      </div>

      <EstanciaList
        estancias={estancias}
        onSelectedIdChange = {onSelectedIdChange}
        onDelete={handleDelete}
      />
    </>
  )

  return (
    <div className="p-4">
      { modo === 'list' && listView }
      { modo === 'edit' && editForm }
      { modo === 'create' && newForm }
    </div>
  )
}
