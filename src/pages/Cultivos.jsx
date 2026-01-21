import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCultivos, deleteCultivo } from '../services/cultivosService'
import CultivoList from '../components/CultivoList'
import { Button } from '@/components/ui/button'

export default function Cultivos() {
  const [cultivos, setCultivos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchCultivos()
  }, [])

  const fetchCultivos = async () => {
    const data = await getCultivos()
    setCultivos(data)
  }

  const handleEdit = (cultivo) => {
    // Si ya tenías edición en la misma pantalla, después podemos moverla a /cultivos/:id/editar.
    // Por ahora, dejo esto como placeholder.
    console.log('edit', cultivo)
  }

  const handleDelete = async (id) => {
    await deleteCultivo(id)
    fetchCultivos()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Listado de Cultivos</h1>
        <Button onClick={() => navigate('/cultivos/nueva')}>Crear Cultivo</Button>
      </div>

      <CultivoList
        cultivos={cultivos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}