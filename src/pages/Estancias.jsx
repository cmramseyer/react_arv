import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEstancias, deleteEstancia } from '../services/estanciasService'
import EstanciaList from '../components/EstanciaList'
import { Button } from '@/components/ui/button'

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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Estancias</h1>
        <Button onClick={() => navigate('/estancias/nueva')}>Crear Estancia</Button>
      </div>

      <EstanciaList
        estancias={estancias}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
