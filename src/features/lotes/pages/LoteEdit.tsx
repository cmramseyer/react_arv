import React from 'react'
import { useParams } from 'react-router-dom'
import LoteForm from '@/features/lotes/components/LoteForm'


export default function LoteEdit() {
  const { id } = useParams<{id: string}>()

  if(!id) { return <div>Error</div>}

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Lote</h2>

        <LoteForm
          formAction='edit'
          showAdjuntos={true}
          loteId={id}
        />

    </div>
  )
}
