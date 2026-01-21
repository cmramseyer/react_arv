import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CultivoForm from '../components/CultivoForm'
import { getCultivo, updateCultivo } from '../services/cultivosService'

export default function CultivoEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cultivo, setCultivo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCultivo(id)
        setCultivo(data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSubmit = async (formData) => {
    await updateCultivo(id, formData)
    navigate('/cultivos')
  }

  if (loading) return <div>Cargando...</div>
  if (!cultivo) return <div>No se encontró el cultivo</div>

  return (
    <div>
      <h2>Editar Cultivo</h2>

      <CultivoForm onSubmit={handleSubmit} cultivo={cultivo} />

      <button onClick={() => navigate('/cultivos')}>
        Volver
      </button>
    </div>
  )
}