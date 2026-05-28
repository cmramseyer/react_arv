import React from 'react'
import MaquinistaForm from '../components/MaquinistaForm'

export default function MaquinistaNew() {
  
  return (
    <div>
      <h2>Nuevo Maquinista</h2>

      <MaquinistaForm formAction="create" />
    </div>
  )
}
