import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEstancias, deleteEstancia } from '../services/estanciasService'
import EstanciaList from '../components/EstanciaList'

export default function Estancias() {
  const [estancias, setEstancias] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchEstancias()
  }, [])

  const fetchEstancias = async () => {
    const data = await getEstancias()
    setEstancias(data)
  }

  const handleEdit = (estancia) => {
    // Si ya tenías edición en la misma pantalla, después podemos moverla a /estancias/:id/editar.
    // Por ahora, dejo esto como placeholder.
    console.log('edit', estancia)
  }

  const handleDelete = async (id) => {
    await deleteEstancia(id)
    fetchEstancias()
  }

  return (
    <div>
      <h1>Listado de Estancias</h1>

      <button onClick={() => navigate('/estancias/nueva')}>
        Nueva Estancia
      </button>

      <EstanciaList
        estancias={estancias}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
