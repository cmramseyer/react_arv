import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaquinistas, deleteMaquinista } from '../services/maquinistasService'
import MaquinistaList from '../components/MaquinistaList'
import { Button } from '@/components/ui/button'

export default function Maquinistas() {
  const [maquinistas, setMaquinistas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchMaquinistas()
  }, [])

  const fetchMaquinistas = async () => {
    const data = await getMaquinistas()
    setMaquinistas(data)
  }

  const handleEdit = (maquinista) => {
    // Si ya tenías edición en la misma pantalla, después podemos moverla a /maquinistas/:id/editar.
    // Por ahora, dejo esto como placeholder.
    console.log('edit', maquinista)
  }

  const handleDelete = async (id) => {
    await deleteMaquinista(id)
    fetchMaquinistas()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Maquinistas</h1>
        <Button onClick={() => navigate('/maquinistas/nueva')}>Crear Maquinista</Button>
      </div>

      <MaquinistaList
        maquinistas={maquinistas}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}