import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLotes, deleteLote } from '../services/lotesService'
import LoteList from '../components/LoteList'

export default function Lotes() {
  const [lotes, setLotes] = useState([])
  const navigate = useNavigate()

  const fetchLotes = async () => {
    const data = await getLotes()
    setLotes(data)
  }

  useEffect(() => {
    fetchLotes()
  }, [])

  const handleDelete = async (id) => {
    await deleteLote(id)
    fetchLotes()
  }

  const handleShow = (lote) => {
    navigate(`/lotes/${lote.id}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Lotes</h2>

        <button
          className="bg-blue-500 text-white px-4 py-1 rounded"
          onClick={() => navigate('/lotes/nuevo')}
        >
          Nuevo Lote
        </button>
      </div>

      <LoteList lotes={lotes} onShow={handleShow} onDelete={handleDelete} />
    </div>
  )
}
