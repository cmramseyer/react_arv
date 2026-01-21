import React from 'react'
import { useNavigate } from 'react-router-dom'
import { createCultivo } from '../services/cultivosService'
import CultivoForm from '../components/CultivoForm'

export default function CultivoNueva() {
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    await createCultivo(formData)
    navigate('/cultivos') // volver al listado
  }

  return (
    <div>
      <h2>Nuevo Cultivo</h2>

      <CultivoForm onSubmit={handleSubmit} />

      <button onClick={() => navigate('/cultivos')}>
        Volver
      </button>
    </div>
  )
}