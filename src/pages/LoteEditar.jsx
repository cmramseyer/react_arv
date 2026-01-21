import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEstancias } from '../services/estanciasService'
import { getLote, updateLote } from '../services/lotesService'
import LoteForm from '../components/LoteForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function LoteEditar() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [estancias, setEstancias] = useState([])
  const [lote, setLote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

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

      {lote && lote.adjuntos && lote.adjuntos.length > 0 && (
        <>
          <h3 className="mt-4 font-semibold">Adjuntos existentes:</h3>
          <ul className="list-disc pl-6">
            {lote.adjuntos.map((adj, idx) => (
              <li key={idx}>
                {adj.url.endsWith('.pdf') ? (
                  <a href={adj.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Ver PDF</a>
                ) : (
                  <img
                    src={adj.url}
                    alt="adjunto"
                    className="w-32 mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setSelectedImage(adj)
                      setModalOpen(true)
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <Button type="button" variant="secondary" onClick={() => navigate('/lotes')}>
        Volver
      </Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Imagen</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.filename || 'adjunto'}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
