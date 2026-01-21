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

export default function CultivoList({ cultivos, onDelete }) {
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
        {cultivos.map((c) => (
          <TableRow key={c.id}>
            <TableCell>{c.nombre}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => navigate(`/cultivos/${c.id}/editar`)}>
                Editar
              </Button>
              <Button variant="default" onClick={() => onDelete(c.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

CultivoList.propTypes = {
  cultivos: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
}