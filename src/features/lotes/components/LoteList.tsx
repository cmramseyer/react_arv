import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import LoteAdjuntosDialog from '@/features/lotes/components/LoteAdjuntosDialog'
import { formatHectareas } from '@/utils/formatHectareas'
import type { Lote } from '@/features/lotes/types'
import type { EntityId } from '@/utils/types'

type LoteListProps = {
  lotes: Lote[],
  onShow: (lote: Lote) => void,
  onDelete: (id: EntityId) => void
}

export default function LoteList({ lotes, onShow, onDelete }: LoteListProps) {
  const navigate = useNavigate()
  const [adjuntosLote, setAdjuntosLote] = useState<Lote | null>(null)

  return (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propietario</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Hectareas</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lotes.map((lote) => {
              const hectareasDisplay = formatHectareas(lote.hectareas)

              return (
                <TableRow key={lote.id}>
                  <TableCell>{lote.nombre_estancia}</TableCell>
                  <TableCell>{lote.nombre}</TableCell>
                  <TableCell>{hectareasDisplay}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onShow(lote)}>
                        Ver
                      </Button>
                      <Button size="sm" onClick={() => navigate(`/lotes/${lote.id}/edit`)}>
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setAdjuntosLote(lote)}>
                        Adjuntos
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(lote.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4 md:hidden">
        {lotes.map((lote) => {
          const hectareasDisplay = formatHectareas(lote.hectareas)

          return (
            <Card key={lote.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-center">
                  {lote.nombre_estancia || 'Sin estancia'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Lote {lote.nombre || 'Sin nombre'}</span>
                <span>{hectareasDisplay}</span>
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => onShow(lote)}>
                  Ver
                </Button>
                <Button size="sm" onClick={() => navigate(`/lotes/${lote.id}/editar`)}>
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAdjuntosLote(lote)}>
                  Adjuntos
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(lote.id)}>
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <LoteAdjuntosDialog
        lote={adjuntosLote}
        open={adjuntosLote !== null}
        onOpenChange={(open) => {
          if (!open) setAdjuntosLote(null)
        }}
      />
    </div>
  )
}
