import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEstancias } from '../services/estanciasService'
import { getLote, updateLote } from '../services/lotesService'
import LoteForm from '../components/LoteForm'

export default function LoteEditar() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [estancias, setEstancias] = useState([])
  const [lote, setLote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [estanciasData, loteData] = await Promise.all([
          getEstancias(),
          getLote(id),
        ])
        setEstancias(estanciasData)
        setLote(loteData)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [id])

  const handleUpdate = async (formData) => {
    await updateLote(id, formData)
    navigate('/lotes')
  }

  if (loading) return <div className="p-4">Cargando...</div>
  if (!lote) return <div className="p-4">No se encontró el lote</div>

  const defaultValues = {
    nombre: lote.nombre ?? '',
    lat: lote.lat ?? '',
    long: lote.long ?? '',
    link_mapa: lote.link_mapa ?? '',
    hectareas: lote.hectareas ?? '',
    estancia_id: lote.estancia_id ?? '',
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Lote</h2>

      <LoteForm
        estancias={estancias}
        defaultValues={defaultValues}
        onSubmit={handleUpdate}
        submitLabel="Actualizar"
      />

      <button className="underline" onClick={() => navigate('/lotes')}>
        Volver
      </button>
    </div>
  )
}
