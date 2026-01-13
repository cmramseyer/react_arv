import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from './ui/button'

export default function LoteList({ lotes, onShow, onDelete }) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Propietario</TableHead>
          <TableHead>Nombre Lote</TableHead>
          <TableHead>Hectareas</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {lotes.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{e.nombre_estancia}</TableCell>
            <TableCell>{e.nombre}</TableCell>
            <TableCell>{e.hectareas}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => onShow(e)}>Ver</Button>
              <Button variant="default" onClick={() => navigate(`/lotes/${e.id}/editar`)}>Editar</Button>
              <Button variant="default" onClick={() => onDelete(e.id)}>Eliminar</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

LoteList.propTypes = {
  lotes: PropTypes.array.isRequired,
  onShow: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
