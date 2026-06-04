import React from 'react'
import { useParams } from 'react-router-dom'
import EstanciaForm from '@/features/estancias/components/EstanciaForm'

export default function EstanciaEdit() {

  const estanciaId = useParams().id

  return (
    <EstanciaForm formAction="edit" estanciaId={estanciaId} />
  )
}
