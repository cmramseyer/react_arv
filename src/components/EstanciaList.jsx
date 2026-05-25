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

export default function EstanciaList({ estancias, onDelete, onSelectedIdChange }) {
  const navigate = useNavigate()


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {estancias.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{e.nombre}</TableCell>
            <TableCell>{e.contacto}</TableCell>
            <TableCell>{e.telefono}</TableCell>
            <TableCell>{e.email}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => onSelectedIdChange(e.id)}>
                Editar
              </Button>
              <Button variant="default" onClick={() => onDelete(e.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

EstanciaList.propTypes = {
  estancias: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
}
