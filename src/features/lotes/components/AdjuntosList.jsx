import React, {useReducer} from 'react'
import { Button } from '@/components/ui/button'
import { useAdjuntoLoteQuery, useAdjuntoLoteMutation } from '@/features/lotes/hooks/useAdjuntoLoteQuery'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'


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
      return { ...state, adjuntoToDelete: action.payload}
    case 'SET_UPLOADING':
      return { ...state, uploading: action.payload }
    default:
      return state
  }
}




export function AdjuntosList({loteId}) {


  const adjuntosLoteQuery = useAdjuntoLoteQuery(loteId)

  const { uploadMutation, deleteMutation } = useAdjuntoLoteMutation()

  const initialAdjuntosDialogState = {
    modalOpen: false,
    deleteDialogOpen: false,
    selectedImage: null,
    selectedFile: null,
    adjuntoToDelete: null,
    uploading: false
  }

  const [adjuntosDialogState, adjuntosDialogDispatch] = useReducer(adjuntosDialogReducer, initialAdjuntosDialogState)

  const { modalOpen, selectedImage, deleteDialogOpen, selectedFile, adjuntoToDelete, uploading } = adjuntosDialogState

  console.log(loteId)

  const adjuntoExists = adjuntosLoteQuery.data && adjuntosLoteQuery.data.length > 0
    
  const handleDeleteAdjunto = (adjuntoId) => {
    adjuntosDialogDispatch({ type: 'SET_ADJUNTO_TO_DELETE', payload: adjuntoId })
    adjuntosDialogDispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: true })
  }
  
  const confirmDelete = async () => {
    console.log(`lote id a borrar: ${adjuntoToDelete}`)
    console.log(`adjunto a borrar: ${adjuntoToDelete}`)
    try {
      //await deleteAdjuntoLote(lote.id, adjuntoToDelete)
      await deleteMutation.mutateAsync({loteId, payload: adjuntoToDelete})
      //const updatedLote = await getLote(id)
      //lotesDispatch({ type: 'SET_LOTE', payload: updatedLote })
    } catch (error) {
      alert('Error al eliminar adjunto')
      console.error(error)
    } finally {
      adjuntosDialogDispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: false })
      adjuntosDialogDispatch({ type: 'SET_ADJUNTO_TO_DELETE', payload: null })
    }
  }
  
  const handleUploadAdjuntoLote = async () => {
    if (!selectedFile) return
    adjuntosDialogDispatch({ type: 'SET_UPLOADING', payload: true })
    try {
      //await uploadAdjuntoLote(lote.id, selectedFile)
      await uploadMutation.mutateAsync({loteId, payload: selectedFile})
      // const updatedLote = await getLote(id)
      // lotesDispatch({ type: 'SET_LOTE', payload: updatedLote })
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

  console.log(`adjuntoExists: ${adjuntoExists}`)

  if(!adjuntoExists) { return null }

  return (
    <>
      <h3 className="mt-4 font-semibold">Adjuntos existentes:</h3>
      <ul className="list-disc pl-6">
        {adjuntosLoteQuery.data.map((adj, idx) => (
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
      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        onChange={(e) => adjuntosDialogDispatch({ type: 'SET_SELECTED_FILE', payload: e.target.files[0] })}
      />
      <Button
        type="button"
        variant="outline"
        onClick={selectedFile ? handleUploadAdjuntoLote : () => document.getElementById('file-input').click()}
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
    </>
  )
}
