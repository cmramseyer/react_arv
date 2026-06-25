import React from 'react'
import LoteForm from '@/features/lotes/components/LoteForm'

export default function LoteNew() {
  return (
    <div className="p-4">
      <LoteForm
        formAction='create'
      />
    </div>
  )
}
