import React, { useRef, useState } from 'react'
import { toast } from 'sonner'

import { AsyncButton } from '@/components/ui/async-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DeleteAdjuntoLoteButton from '@/features/lotes/components/DeleteAdjuntoLoteButton'
import { useAdjuntoLoteQuery, useUploadAdjuntoLoteMutation } from '@/features/lotes/hooks/useAdjuntoLoteQuery'
import { toastText } from '@/lib/toast'
import type { Lote } from '@/features/lotes/types'

type LoteAdjuntosDialogProps = {
  lote: Lote | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoteAdjuntosDialog({ lote, open, onOpenChange }: LoteAdjuntosDialogProps) {
  if (!lote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjuntos del lote {lote.nombre}</DialogTitle>
          <DialogDescription className="sr-only">
            Listado de adjuntos del lote con opciones para agregar y eliminar.
          </DialogDescription>
        </DialogHeader>

        <LoteAdjuntosContent loteId={lote.id} />

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type LoteAdjuntosContentProps = {
  loteId: number | string
}

function LoteAdjuntosContent({ loteId }: LoteAdjuntosContentProps) {
  const adjuntosQuery = useAdjuntoLoteQuery(loteId)
  const uploadMutation = useUploadAdjuntoLoteMutation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!selectedFile) return
    const promise = uploadMutation.mutateAsync({ loteId, payload: selectedFile })
    toast.promise(promise, toastText('lote', 'upload'))
    try {
      await promise
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  if (adjuntosQuery.isLoading) { return <div>Cargando adjuntos...</div> }
  if (adjuntosQuery.isError) { return <div>Error: {adjuntosQuery.error?.message}</div> }

  const adjuntos = adjuntosQuery.data ?? []

  return (
    <div className="space-y-4">
      {adjuntos.length === 0 ? (
        <div>Sin adjuntos</div>
      ) : (
        <ul className="space-y-2">
          {adjuntos.map((adjunto) => (
            <li key={adjunto.id} className="flex items-center justify-between gap-2">
              <span className="text-sm">{adjunto.filename || adjunto.url}</span>
              <DeleteAdjuntoLoteButton loteId={loteId} adjuntoId={adjunto.id} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          aria-label="Nuevo plano o imagen"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
        <AsyncButton
          type="button"
          variant="outline"
          isLoading={uploadMutation.isPending}
          disabled={!selectedFile}
          onClick={handleUpload}
        >
          Subir
        </AsyncButton>
      </div>
    </div>
  )
}
