import React from 'react'
import PropTypes from 'prop-types'
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
import formatHectareas from '../utils/formatHectareas'

export default function LoteList({ lotes, onShow, onDelete }) {
  const navigate = useNavigate()

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
              const hectareasLabel = formatHectareas(lote.hectareas)
              const hectareasDisplay = hectareasLabel === 'Sin datos'
                ? hectareasLabel
                : `${hectareasLabel} ha`

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
                      <Button size="sm" onClick={() => navigate(`/lotes/${lote.id}/editar`)}>
                        Editar
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
          const hectareasLabel = formatHectareas(lote.hectareas)
          const hectareasDisplay = hectareasLabel === 'Sin datos'
            ? hectareasLabel
            : `${hectareasLabel} ha`

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
                <Button variant="destructive" size="sm" onClick={() => onDelete(lote.id)}>
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

LoteList.propTypes = {
  lotes: PropTypes.array.isRequired,
  onShow: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
