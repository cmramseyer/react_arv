import React, { useEffect, useState, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import EstanciaList from '../components/EstanciaList'
import { Button } from '@/components/ui/button'
import { useEstanciasQuery, useMutationsEstancia } from '../hooks/useEstanciaQuery'

const estanciaReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ESTANCIAS':
      return { ...state, 
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
        selectedId: null
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
  
  const navigate = useNavigate()

  const estanciasQuery = useEstanciasQuery()

  const { deleteMutation } = useMutationsEstancia()

  const handleDelete = (id) => {
    deleteMutation.mutate(id)
  }

  const deleteErrorMessage = deleteMutation.error?.message

  const handleEdit = (id) => {
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
            estancias={estanciasQuery.data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleteErrorMessage={deleteErrorMessage}
          />
        }
      </>
    </div>
  )
}