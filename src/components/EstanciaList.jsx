import { React } from 'react'
import PropTypes from 'prop-types'

export default function EstanciaList({ estancias, onEdit, onDelete }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Contacto</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {estancias.map((e) => (
          <tr key={e.id}>
            <td>{e.nombre}</td>
            <td>{e.contacto}</td>
            <td>{e.telefono}</td>
            <td>{e.email}</td>
            <td>
              <button onClick={() => onEdit(e)}>Editar</button>
              <button onClick={() => onDelete(e.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

EstanciaList.propTypes = {
  estancias: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}