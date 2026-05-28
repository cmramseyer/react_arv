import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'
import LoteForm from '../components/LoteForm'

export default function LoteNuevo() {
  
  
  /* 
  const [estancias, setEstancias] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEstancias = async () => {
      const data = await getEstancias()
      setEstancias(data)
    }
    fetchEstancias()
  }, [])

  const handleCreate = async (formData) => {
    await createLote(formData)
    navigate('/lotes')
  }
 */
  return (
    <div className="p-4">
      <LoteForm
        formAction='create'
        loteId={1}
      />
    </div>
  )
}
