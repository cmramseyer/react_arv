import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { getLotes, getLotesPorEstancia, deleteLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'
import LoteList from '../components/LoteList'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Lotes() {
  const [lotes, setLotes] = useState([])
  const [estancias, setEstancias] = useState([])
  const [selectedEstanciaId, setSelectedEstanciaId] = useState('')
  const navigate = useNavigate()

  const fetchLotes = async (estanciaId = '') => {
    const data = estanciaId ? await getLotesPorEstancia(estanciaId) : await getLotes()
    setLotes(data)
  }

  const fetchEstancias = async () => {
    const data = await getEstancias()
    setEstancias(data)
  }

  useEffect(() => {
    fetchEstancias()
    fetchLotes()
  }, [])

  useEffect(() => {
    fetchLotes(selectedEstanciaId)
  }, [selectedEstanciaId])

  const handleDelete = async (id) => {
    await deleteLote(id)
    fetchLotes()
  }

  const handleShow = (lote) => {
    navigate(`/lotes/${lote.id}`)
  }

  const handleSelectEstancia = (value) => {
    setSelectedEstanciaId(value === 'all' ? '' : value)
  }

  const handleResetEstancia = () => {
    setSelectedEstanciaId('')
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Lotes</h2>

        <Button onClick={() => navigate('/lotes/nuevo')}>Crear lote</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm font-medium">Filtrar por Estancia:</span>
        <div className="flex items-center gap-2">
          <Select value={selectedEstanciaId || 'all'} onValueChange={handleSelectEstancia}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todas las estancias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las estancias</SelectItem>
              {estancias.map((estancia) => (
                <SelectItem key={String(estancia.id)} value={String(estancia.id)}>
                  {estancia.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEstanciaId && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleResetEstancia}
              aria-label="Limpiar filtro"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <LoteList lotes={lotes} onShow={handleShow} onDelete={handleDelete} />
    </div>
  )
}
