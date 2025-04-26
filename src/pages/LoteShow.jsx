import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLote } from '../services/lotesService'

export default function LoteShow() {
  const { id } = useParams()
  const [lote, setLote] = useState(null)

  useEffect(() => {
    getLote(id).then(setLote)
  }, [id])

  if (!lote) return <p className="p-4">Cargando...</p>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{lote.nombre}</h2>
      <p>Lat: {lote.lat}</p>
      <p>Long: {lote.long}</p>
      <p>Hectáreas: {lote.hectareas}</p>
      <p>Link mapa: <a href={lote.link_mapa} className="text-blue-500 underline">{lote.link_mapa}</a></p>
      <h3 className="mt-4 font-semibold">Adjuntos:</h3>
      <ul className="list-disc pl-6">
        {lote.adjuntos?.map((adj, idx) => (
          <li key={idx}>
            {adj.url.endsWith('.pdf') ? (
              <a href={adj.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Ver PDF</a>
            ) : (
              <img src={adj.url} alt="adjunto" className="w-32 mt-2" />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
