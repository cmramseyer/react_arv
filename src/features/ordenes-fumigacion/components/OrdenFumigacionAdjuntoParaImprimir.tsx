import React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { OrdenFumigacionAdjunto } from '@/features/ordenes-fumigacion/types'
import type { EntityId } from '@/utils/types'

type PrintableAdjunto = OrdenFumigacionAdjunto & {
  id: EntityId
  filename: string
  url: string
}

type OrdenFumigacionAdjuntoParaImprimirProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoadingAdjuntos: boolean
  hasAdjuntos: boolean
  adjuntos: PrintableAdjunto[]
  selectedAdjuntos: Set<string>
  onToggleAdjunto: (adjuntoId: EntityId) => void
  isImageAdjunto: (adjunto: PrintableAdjunto) => boolean
  onEditarAdjunto: (adjunto: PrintableAdjunto) => void
  isSavingAdjunto: boolean
  adjuntoEditando: PrintableAdjunto | null
  adjuntoEnEdicion: string | null
  normalizeAdjuntoId: (adjuntoId: EntityId) => string
  onImprimir: () => void | Promise<void>
  labelImprimirSeleccion: string
}

export default function OrdenFumigacionAdjuntoParaImprimir({
  open,
  onOpenChange,
  isLoadingAdjuntos,
  hasAdjuntos,
  adjuntos,
  selectedAdjuntos,
  onToggleAdjunto,
  isImageAdjunto,
  onEditarAdjunto,
  isSavingAdjunto,
  adjuntoEditando,
  adjuntoEnEdicion,
  normalizeAdjuntoId,
  onImprimir,
  labelImprimirSeleccion,
}: OrdenFumigacionAdjuntoParaImprimirProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjuntos para PDF</DialogTitle>
          <DialogDescription>
            Selecciona los adjuntos para el PDF o edita una imagen antes de imprimir.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoadingAdjuntos && (
            <div className="text-sm text-muted-foreground">Cargando adjuntos...</div>
          )}
          {!isLoadingAdjuntos && !hasAdjuntos && (
            <div className="text-sm text-muted-foreground">No hay adjuntos disponibles.</div>
          )}
          {!isLoadingAdjuntos && hasAdjuntos && (
            <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {adjuntos.map((adjunto) => (
                <div
                  key={adjunto.id}
                  className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selectedAdjuntos.has(normalizeAdjuntoId(adjunto.id))}
                    onCheckedChange={() => onToggleAdjunto(adjunto.id)}
                  />
                  {isImageAdjunto(adjunto) ? (
                    <img
                      src={adjunto.url}
                      alt={adjunto.filename}
                      className="h-16 w-20 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-20 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                      Archivo
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{adjunto.filename}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEditarAdjunto(adjunto)}
                      disabled={isSavingAdjunto || Boolean(adjuntoEditando) || !isImageAdjunto(adjunto)}
                    >
                      {adjuntoEnEdicion === normalizeAdjuntoId(adjunto.id) ? 'Guardando...' : 'Editar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={onImprimir} disabled={isSavingAdjunto || isLoadingAdjuntos}>
            {labelImprimirSeleccion}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
