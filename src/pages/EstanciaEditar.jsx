import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import EstanciaForm from '../components/EstanciaForm'
import { getEstancia, updateEstancia } from '../services/estanciasService'

export default function EstanciaEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [estancia, setEstancia] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getEstancia(id)
        setEstancia(data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSubmit = async (formData) => {
    await updateEstancia(id, formData)
    navigate('/estancias')
  }

  if (loading) return <div>Cargando...</div>
  if (!estancia) return <div>No se encontró la estancia</div>

  return (
    <div>
      <h2>Editar Estancia</h2>

      <EstanciaForm
        onSubmit={handleSubmit}
        estancia={estancia}
        actions={(
          <Button type="button" variant="secondary" onClick={() => navigate('/estancias')}>
            Volver
          </Button>
        )}
      />
    </div>
  )
}
