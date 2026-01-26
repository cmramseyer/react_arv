import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MaquinistaForm from '../components/MaquinistaForm'
import { Button } from '@/components/ui/button'
import { getMaquinista, updateMaquinista } from '../services/maquinistasService'

export default function MaquinistaEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [maquinista, setMaquinista] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMaquinista(id)
        setMaquinista(data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSubmit = async (formData) => {
    await updateMaquinista(id, formData)
    navigate('/maquinistas')
  }

  if (loading) return <div>Cargando...</div>
  if (!maquinista) return <div>No se encontró el maquinista</div>

  return (
    <div>
      <h2>Editar Maquinista</h2>

      <MaquinistaForm
        onSubmit={handleSubmit}
        maquinista={maquinista}
        actions={(
          <Button type="button" variant="secondary" onClick={() => navigate('/maquinistas')}>
            Volver
          </Button>
        )}
      />
    </div>
  )
}
