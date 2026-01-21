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

export default function MaquinistaList({ maquinistas, onDelete }) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {maquinistas.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.nombre}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => navigate(`/maquinistas/${m.id}/editar`)}>
                Editar
              </Button>
              <Button variant="default" onClick={() => onDelete(m.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

MaquinistaList.propTypes = {
  maquinistas: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
}