import React, { useEffect, useState, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEstancias } from '../services/estanciasService'
import { getLote, updateLote, deleteAdjuntoLote, uploadAdjuntoLote } from '../services/lotesService'
import LoteForm from '../components/LoteForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const editLoteReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ESTANCIAS':
      return { ...state, estancias: action.payload }
    case 'SET_LOTE':
      return { ...state, lote: action.payload, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const adjuntosDialogReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODAL_OPEN':
      return { ...state, modalOpen: action.payload }
    case 'SET_SELECTED_IMAGE':
      return { ...state, selectedImage: action.payload, modalOpen: true }
    case 'SET_DELETE_DIALOG_OPEN':
      return { ...state, deleteDialogOpen: action.payload }
    case 'SET_SELECTED_FILE':
      return { ...state, selectedFile: action.payload }
    case 'SET_ADJUNTO_TO_DELETE':
      return { ...state, adjuntoToDelete: action.payload }
    case 'SET_UPLOADING':
      return { ...state, uploading: action.payload }
    default:
      return state
  }
}

export default function LoteEditar() {
  const { id } = useParams()
  const navigate = useNavigate()


  const initialEditLoteState = {
    estancias: [],
    lote: null,
    loading: true
  }

  const initialAdjuntosDialogState = {
    modalOpen: false,
    deleteDialogOpen: false,
    selectedImage: null,
    selectedFile: null,
    adjuntoToDelete: null,
    uploading: false
  }


  const [lotesState, lotesDispatch] = useReducer(editLoteReducer, initialEditLoteState)
  const { estancias, lote, loading } = lotesState


  const [adjuntosDialogState, adjuntosDialogDispatch] = useReducer(adjuntosDialogReducer, initialAdjuntosDialogState)

  const { modalOpen, selectedImage, deleteDialogOpen, selectedFile, adjuntoToDelete, uploading } = adjuntosDialogState

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [estanciasData, loteData] = await Promise.all([
          getEstancias(),
          getLote(id),
        ])
        lotesDispatch({ type: 'SET_ESTANCIAS', payload: estanciasData })
        lotesDispatch({ type: 'SET_LOTE', payload: loteData })
      } finally {
        lotesDispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    fetchAll()
  }, [id])

  const handleUpdate = async (formData) => {
    await updateLote(id, formData)
    navigate('/lotes')
  }

  const handleDeleteAdjunto = (adjuntoId) => {
    adjuntosDialogDispatch({ type: 'SET_ADJUNTO_TO_DELETE', payload: adjuntoId })
  }

  const confirmDelete = async () => {
    try {
      await deleteAdjuntoLote(id, adjuntoToDelete)
      const updatedLote = await getLote(id)
      lotesDispatch({ type: 'SET_LOTE', payload: updatedLote })
    } catch (error) {
      alert('Error al eliminar adjunto')
      console.error(error)
    } finally {
      adjuntosDialogDispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: false })
      adjuntosDialogDispatch({ type: 'SET_ADJUNTO_TO_DELETE', payload: null })
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    adjuntosDialogDispatch({ type: 'SET_UPLOADING', payload: true })
    try {
      await uploadAdjuntoLote(id, selectedFile)
      const updatedLote = await getLote(id)
      lotesDispatch({ type: 'SET_LOTE', payload: updatedLote })
      adjuntosDialogDispatch({ type: 'SET_SELECTED_FILE', payload: null })
      // Reset input
      document.getElementById('file-input').value = ''
    } catch (error) {
      alert('Error al subir adjunto')
      console.error(error)
    } finally {
      adjuntosDialogDispatch({ type: 'SET_UPLOADING', payload: false })
    }
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
          showAdjuntos={false}
          actions={(
            <Button type="button" variant="secondary" onClick={() => navigate('/lotes')}>
              Volver
            </Button>
          )}
        />

      {lote && lote.adjuntos && lote.adjuntos.length > 0 && (
        <>
          <h3 className="mt-4 font-semibold">Adjuntos existentes:</h3>
          <ul className="list-disc pl-6">
            {lote.adjuntos.map((adj, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {adj.url.endsWith('.pdf') ? (
                  <a href={adj.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Ver PDF</a>
                ) : (
                  <img
                    src={adj.url}
                    alt="adjunto"
                    className="w-32 mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {adjuntosDialogDispatch({ type: 'SET_SELECTED_IMAGE', payload: adj })
                    }}
                  />
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDeleteAdjunto(adj.id)}>
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        onChange={(e) => adjuntosDialogDispatch({ type: 'SET_SELECTED_FILE', payload: e.target.files[0] })}
      />
      <Button
        type="button"
        variant="outline"
        onClick={selectedFile ? handleUpload : () => document.getElementById('file-input').click()}
        disabled={uploading}
      >
        {uploading ? 'Subiendo...' : selectedFile ? 'Subir plano' : 'Agregar plano'}
      </Button>

      <Dialog open={modalOpen} onOpenChange={(open)=> adjuntosDialogDispatch({ type: 'SET_MODAL_OPEN', payload: open })}>
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

      <Dialog open={deleteDialogOpen} onOpenChange={(open)=> adjuntosDialogDispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p>¿Confirma la eliminación del adjunto?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => adjuntosDialogDispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: false })}>
              No
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Sí
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
