import React from 'react'
import { useParams } from 'react-router-dom'
import MaquinistaForm from '@/features/maquinistas/components/MaquinistaForm'

export default function MaquinistaEdit() {
  
  const id = useParams('id').id

  return (
    <div>
      <h2>Editar Maquinista</h2>

      <MaquinistaForm formAction="edit" id={id} />
    </div>
  )
}
