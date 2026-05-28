import React from 'react'
import { useNavigate } from 'react-router-dom'
import { createCultivo } from '../services/cultivosService'
import { Button } from '@/components/ui/button'
import CultivoForm from '../components/CultivoForm'

export default function CultivoNew() {
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    await createCultivo(formData)
    navigate('/cultivos') // volver al listado
  }

  return (
    <div>
      <h2>Nuevo Cultivo</h2>

      <CultivoForm
        onSubmit={handleSubmit}
        actions={(
          <Button type="button" variant="secondary" onClick={() => navigate('/cultivos')}>
            Volver
          </Button>
        )}
      />
    </div>
  )
}
