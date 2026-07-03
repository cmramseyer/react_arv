import React from 'react'
import { useParams } from 'react-router-dom'

import OrdenFumigacionForm from '@/features/ordenes-fumigacion/components/OrdenFumigacionForm'

export default function OrdenFumigacionEdit() {
  const { id } = useParams()

  if(!id) { return <div>Error</div> }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Orden de Fumigación</h2>
      <OrdenFumigacionForm formAction="edit" ordenId={id} />
    </div>
  )
}
