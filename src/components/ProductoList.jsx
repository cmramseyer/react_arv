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
} from '@/components/ui/table'

import { Button } from './ui/button'

export default function ProductoList({ productos, onDelete }) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Unidad</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {productos.map((producto) => (
          <TableRow key={producto.id}>
            <TableCell>{producto.nombre}</TableCell>
            <TableCell>{producto.tipo_producto}</TableCell>
            <TableCell>{producto.unidad_medida}</TableCell>
            <TableCell>
              <Button variant="default" onClick={() => navigate(`/productos/${producto.id}/editar`)}>
                Editar
              </Button>
              <Button variant="default" onClick={() => onDelete(producto.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

ProductoList.propTypes = {
  productos: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
}
