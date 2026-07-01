import React from 'react'
import { useParams } from 'react-router-dom'
import EstanciaForm from '@/features/estancias/components/EstanciaForm'

export default function EstanciaEdit() {

  const { id } = useParams<{id: string}>()

  if (!id) { return <div>Error</div>}

  return (
    <EstanciaForm formAction="edit" estanciaId={id} />
  )
}
