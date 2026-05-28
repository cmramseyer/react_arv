import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CultivoForm from '../components/CultivoForm'
import { Button } from '@/components/ui/button'
import { getCultivo, updateCultivo } from '../services/cultivosService'

export default function CultivoEdit() {
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

      <CultivoForm
        onSubmit={handleSubmit}
        cultivo={cultivo}
        actions={(
          <Button type="button" variant="secondary" onClick={() => navigate('/cultivos')}>
            Volver
          </Button>
        )}
      />
    </div>
  )
}
