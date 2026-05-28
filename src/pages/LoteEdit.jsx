import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoteForm from '../components/LoteForm'


export default function LoteEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Loteee</h2>

        <LoteForm
          formAction='edit'
          showAdjuntos={true}
          loteId={id}
        />

    </div>
  )
}
