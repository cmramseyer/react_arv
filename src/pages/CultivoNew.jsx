import React from 'react'
import CultivoForm from '../components/CultivoForm'

export default function CultivoNew() {
  return (
    <div>
      <h2>Nuevo Cultivo</h2>
      <CultivoForm formAction="create" />
    </div>
  )
}
