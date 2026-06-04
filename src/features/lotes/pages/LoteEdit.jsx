import React from 'react'
import { useParams } from 'react-router-dom'
import LoteForm from '@/features/lotes/components/LoteForm'


export default function LoteEdit() {
  const { id } = useParams()
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
