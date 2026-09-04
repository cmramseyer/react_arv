import React from 'react'
import { useNavigate } from 'react-router-dom'
import EstanciaForm from '@/features/estancias/components/EstanciaForm'
import { useCreateEstanciaMutation } from '@/features/estancias/hooks/useEstanciaQuery'
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'

export default function EstanciaNew() {
  const navigate = useNavigate()
  const createMutation = useCreateEstanciaMutation()

  const handleSubmit = async (values: EstanciaFormValues) => {
    try {
      await createMutation.mutateAsync(values)
      navigate('/estancias')
    } catch {
      // The mutation error is rendered by the form.
    }
  }

  return (
    <EstanciaForm
      isSubmitting={createMutation.isPending}
      onCancel={() => navigate('/estancias')}
      onSubmit={handleSubmit}
      submitError={createMutation.error?.message}
      submitLabel="Grabar"
    />
  )
}
