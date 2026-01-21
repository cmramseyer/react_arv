import React from 'react'
import { useNavigate } from 'react-router-dom'
import { createMaquinista } from '../services/maquinistasService'
import MaquinistaForm from '../components/MaquinistaForm'

export default function MaquinistaNueva() {
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    await createMaquinista(formData)
    navigate('/maquinistas') // volver al listado
  }

  return (
    <div>
      <h2>Nuevo Maquinista</h2>

      <MaquinistaForm onSubmit={handleSubmit} />

      <button onClick={() => navigate('/maquinistas')}>
        Volver
      </button>
    </div>
  )
}