import React from 'react'
import { useNavigate } from 'react-router-dom'
import { createEstancia } from '../services/estanciasService'
import EstanciaForm from '../components/EstanciaForm'

export default function EstanciaNueva() {
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    await createEstancia(formData)
    navigate('/estancias') // volver al listado
  }

  return (
    <div>
      <h2>Nueva Estancia</h2>

      <EstanciaForm onSubmit={handleSubmit} />

      <button onClick={() => navigate('/estancias')}>
        Volver
      </button>
    </div>
  )
}
