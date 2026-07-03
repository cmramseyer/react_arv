import React from 'react'
import { useParams } from 'react-router-dom'
import CultivoForm from '@/features/cultivos/components/CultivoForm'

export default function CultivoEdit() {
  const { id } = useParams()

  if(!id) { return <div>Error</div> }
  
  return (
    <div>
      <h2>Editar Cultivo</h2>
      <CultivoForm id={id} formAction="edit" />
    </div>
  )
}
