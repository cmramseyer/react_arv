import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLote } from '../services/lotesService'
import { getEstancias } from '../services/estanciasService'
import LoteForm from '../components/LoteForm'

export default function LoteNew() {
  return (
    <div className="p-4">
      <LoteForm
        formAction='create'
      />
    </div>
  )
}
